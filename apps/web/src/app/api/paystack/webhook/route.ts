import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/paystack";
import { reconcileFromTransaction } from "@/lib/payments";

export const runtime = "nodejs";

interface PaystackEvent {
  event: string;
  data: {
    id?: number;
    reference?: string;
    status?: string;
    channel?: string;
  };
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  const signatureValid = verifyWebhookSignature(raw, signature);

  // Always parse, but only act on verified events.
  let event: PaystackEvent;
  try {
    event = JSON.parse(raw) as PaystackEvent;
  } catch {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const dedupeKey = `paystack:${event.event}:${
    event.data?.id ?? event.data?.reference ?? "unknown"
  }`;

  // Idempotency: Paystack retries deliveries, so a repeat is a no-op.
  const seen = await prisma.paymentEvent.findUnique({ where: { dedupeKey } });
  if (seen) {
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }
  await prisma.paymentEvent.create({
    data: {
      dedupeKey,
      eventType: event.event,
      reference: event.data?.reference ?? null,
      signatureValid,
      payload: raw,
    },
  });

  if (!signatureValid) {
    // Recorded for inspection, but not trusted.
    return NextResponse.json({ received: true, verified: false }, { status: 200 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    const outcome = await reconcileFromTransaction({
      reference: event.data.reference,
      status: "success",
      id: event.data.id ?? 0,
      channel: event.data.channel,
    });
    await prisma.paymentEvent.updateMany({
      where: { dedupeKey },
      data: { processed: outcome !== "unknown" },
    });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
