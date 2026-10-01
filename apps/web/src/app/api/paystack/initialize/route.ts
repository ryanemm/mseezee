import { NextResponse } from "next/server";
import { MIN_CONTRIBUTION_CENTS, estimateFeeCents, formatZAR } from "@mseezee/shared";
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
  methodId?: string;
}

/** Our payment-method ids -> Paystack checkout channels. PayShap has no known
 *  Paystack channel, so it (and anything unknown) leaves checkout unrestricted. */
const CHANNELS_BY_METHOD: Record<string, string[]> = {
  instant_eft: ["eft"],
  capitec_pay: ["capitec_pay"],
  card: ["card"],
};

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
  if (!Number.isInteger(body.amountCents) || body.amountCents < MIN_CONTRIBUTION_CENTS) {
    return NextResponse.json(
      { error: `Minimum contribution is ${formatZAR(MIN_CONTRIBUTION_CENTS)}.` },
      { status: 400 },
    );
  }

  const circle = await api.getCircle(body.circleSlug);
  if (!circle) {
    return NextResponse.json({ error: "Circle not found" }, { status: 404 });
  }
  if (circle.isDemo) {
    // The UI already hides the Contribute button for these, but that's a
    // convenience, not the security boundary — this is. Never move or relax
    // this check based on what the client sends.
    return NextResponse.json(
      { error: "This is example content and isn't open for contributions." },
      { status: 403 },
    );
  }
  // Mock fixture circles have no DB row and so no subaccount — they fall
  // back to the platform's own account, same as an organiser who hasn't set
  // up a payout account yet.
  const dbCircle = await prisma.circle.findUnique({
    where: { slug: circle.slug },
    select: { payoutSubaccountCode: true },
  });

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
      subaccountCode: dbCircle?.payoutSubaccountCode ?? undefined,
      platformChargeCents: tipCents,
      channels: body.methodId ? CHANNELS_BY_METHOD[body.methodId] : undefined,
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
