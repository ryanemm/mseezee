import { NextResponse } from "next/server";
import { estimateFeeCents } from "@mseezee/shared";
import { api } from "@/lib/api";
import { prisma } from "@/lib/db";
import { initializeTransaction, isPaystackConfigured } from "@/lib/paystack";
import { newReference } from "@/lib/payments";

export const runtime = "nodejs";

interface Body {
  circleSlug: string;
  email: string;
  amountCents: number;
  tipCents: number;
  coverFee: boolean;
  displayName: string;
  message?: string;
  anonymous: boolean;
  showAmount: boolean;
  showArea: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!isPaystackConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured. Set PAYSTACK_SECRET_KEY." },
      { status: 503 },
    );
  }
  if (process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_live_")) {
    // Loud on purpose — this app has no auth, no entity account, and no
    // attorney sign-off yet. Live keys should only ever be in here briefly,
    // for a deliberate manual smoke test.
    console.warn(
      "⚠️  PAYSTACK IS LIVE — real money will move on this request.",
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!EMAIL_RE.test(body.email ?? "")) {
    return NextResponse.json(
      { error: "A valid email is needed for your receipt." },
      { status: 400 },
    );
  }
  if (!Number.isInteger(body.amountCents) || body.amountCents < 1000) {
    return NextResponse.json(
      { error: "Minimum contribution is R10." },
      { status: 400 },
    );
  }

  const circle = await api.getCircle(body.circleSlug);
  if (!circle) {
    return NextResponse.json({ error: "Circle not found" }, { status: 404 });
  }

  const tipCents = Math.max(0, Math.trunc(body.tipCents || 0));
  const feeCents = body.coverFee ? estimateFeeCents(body.amountCents) : 0;
  const totalChargedCents = body.amountCents + tipCents + feeCents;

  const reference = newReference();
  const origin = new URL(request.url).origin;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;

  await prisma.contribution.create({
    data: {
      reference,
      circleId: circle.id,
      circleSlug: circle.slug,
      contributorEmail: body.email.trim().toLowerCase(),
      displayName: body.anonymous
        ? "Anonymous"
        : body.displayName.trim() || "A supporter",
      message: body.message?.trim() || null,
      anonymous: body.anonymous,
      showAmount: body.showAmount,
      showArea: body.showArea,
      amountCents: body.amountCents,
      feeCents,
      tipCents,
      totalChargedCents,
    },
  });

  try {
    const result = await initializeTransaction({
      email: body.email.trim().toLowerCase(),
      amountCents: totalChargedCents,
      reference,
      callbackUrl: `${appUrl}/circles/${circle.slug}/contribute/callback`,
      subaccountCode: process.env.PAYSTACK_TEST_SUBACCOUNT || undefined,
      platformChargeCents: tipCents,
      metadata: {
        circleId: circle.id,
        circleSlug: circle.slug,
        contributor: body.anonymous ? "Anonymous" : body.displayName,
      },
    });
    return NextResponse.json({
      authorizationUrl: result.authorization_url,
      reference,
    });
  } catch (err) {
    await prisma.contribution.update({
      where: { reference },
      data: { status: "failed", failedAt: new Date() },
    });
    const message =
      err instanceof Error ? err.message : "Could not start the payment.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
