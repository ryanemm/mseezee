import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ContributionReceipt } from "@mseezee/shared";
import { api } from "@/lib/api";
import { prisma } from "@/lib/db";
import { verifyTransaction } from "@/lib/paystack";
import { reconcileFromTransaction } from "@/lib/payments";
import { ThankYou } from "@/components/contribute/ThankYou";

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
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <h1 className="text-xl">We couldn&apos;t find that payment</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        If you were charged, it will still reach the circle — nothing is lost.
        Check your bank SMS, or try again.
      </p>
      <Link
        href={`/circles/${slug}`}
        className="pt-2 text-sm font-semibold text-forest"
      >
        Back to the circle
      </Link>
    </div>
  );
}

function PaymentFailed({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <h1 className="text-xl">The payment didn&apos;t go through</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        You have not been charged. You can try again with another method.
      </p>
      <Link
        href={`/circles/${slug}/contribute`}
        className="pt-2 text-sm font-semibold text-forest"
      >
        Try again
      </Link>
    </div>
  );
}
