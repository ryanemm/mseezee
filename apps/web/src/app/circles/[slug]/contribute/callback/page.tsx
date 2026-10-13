import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ContributionReceipt } from "@mseezee/shared";
import { api } from "@/lib/api";
import { prisma } from "@/lib/db";
import { verifyTransaction } from "@/lib/paystack";
import { reconcileFromTransaction } from "@/lib/payments";
import { ThankYou } from "@/components/contribute/ThankYou";
import { Placeholder } from "@/components/layout/Placeholder";

export const metadata: Metadata = { title: "Thank you" };
export const dynamic = "force-dynamic";

export default async function CallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const { slug } = await params;
  const { reference, trxref } = await searchParams;
  const ref = reference ?? trxref;

  const circle = await api.getCircle(slug);
  if (!circle) notFound();

  if (!ref) {
    return <MissingReference slug={slug} />;
  }

  const contribution = await prisma.contribution.findUnique({
    where: { reference: ref },
  });
  if (!contribution || contribution.circleSlug !== slug) {
    return <MissingReference slug={slug} />;
  }

  // Verify directly with Paystack — don't wait on the webhook for the UI.
  let settled = contribution.status === "settled";
  let failed = contribution.status === "failed";
  try {
    const txn = await verifyTransaction(ref);
    const outcome = await reconcileFromTransaction({
      reference: ref,
      status: txn.status,
      id: txn.id,
      channel: txn.channel,
    });
    settled = outcome === "settled";
    failed = outcome === "failed";
  } catch {
    // Fall back to whatever the DB already has.
  }

  if (failed) {
    return <PaymentFailed slug={slug} />;
  }

  const receipt: ContributionReceipt = {
    id: contribution.id,
    circleId: contribution.circleId,
    circleTitle: circle.title,
    beneficiaryName: circle.beneficiaryName,
    amountCents: contribution.amountCents,
    feeCents: contribution.feeCents,
    tipCents: contribution.tipCents,
    totalChargedCents: contribution.totalChargedCents,
    createdAt: contribution.createdAt.toISOString(),
  };

  return <ThankYou circle={circle} receipt={receipt} pending={!settled} />;
}

function MissingReference({ slug }: { slug: string }) {
  return (
    <Placeholder
      title="We couldn't find that payment"
      body="If you were charged, it will still reach the circle — nothing is lost. Check your bank SMS, or try again."
      actionHref={`/circles/${slug}`}
      actionLabel="Back to the circle"
    />
  );
}

function PaymentFailed({ slug }: { slug: string }) {
  return (
    <Placeholder
      title="The payment didn't go through"
      body="You have not been charged. You can try again with another method."
      actionHref={`/circles/${slug}/contribute`}
      actionLabel="Try again"
    />
  );
}
