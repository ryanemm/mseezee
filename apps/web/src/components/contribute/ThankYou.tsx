"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Circle, ContributionReceipt } from "@mseezee/shared";
import { formatZAR } from "@mseezee/shared";
import { ButtonLink } from "@/components/ui/Button";
import { ShareCircle } from "@/components/circle/ShareCircle";
import { CheckIcon, ClockIcon } from "@/components/ui/Icons";
import { circleSupporterMessage } from "@/lib/share";
import { clearContribution, loadReceipt } from "@/lib/draft";

export function ThankYou({
  circle,
  receipt: receiptProp,
  pending = false,
}: {
  circle: Circle;
  /** When set (real payment callback), used directly instead of sessionStorage. */
  receipt?: ContributionReceipt;
  /** Payment confirmed by the provider, or still clearing. */
  pending?: boolean;
}) {
  const router = useRouter();
  const [receipt, setReceipt] = useState<ContributionReceipt | null>(
    receiptProp ?? null,
  );

  useEffect(() => {
    if (receiptProp) return;
    const r = loadReceipt(circle.slug);
    if (!r) {
      router.replace(`/circles/${circle.slug}`);
      return;
    }
    setReceipt(r);
  }, [circle.slug, router, receiptProp]);

  if (!receipt) {
    return <p className="px-5 py-10 text-center text-sm text-ink-faint">…</p>;
  }

  const beneficiaryShort = circle.beneficiaryName.replace(" family", "");

  return (
    <div className="min-h-dvh bg-surface">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-7 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+3rem)] text-center">
        <div
          className={`flex size-24 items-center justify-center rounded-full ${
            pending ? "bg-surface-sunk text-ink" : "bg-lime text-on-lime"
          }`}
        >
          {pending ? <ClockIcon className="size-11" /> : <CheckIcon className="size-12" />}
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-[2rem] font-extrabold leading-tight">
            {pending ? "Almost there" : "Ngiyabonga. Thank you."}
          </h1>
          <p className="text-[1.02rem] text-ink-soft">
            {pending
              ? `We're confirming your ${formatZAR(
                  receipt.amountCents,
                )} with the bank. Your receipt follows by email once it clears.`
              : `Your ${formatZAR(receipt.amountCents)} is on its way to ${
                  circle.proxyName ?? circle.beneficiaryName
                }. ${circle.organiserName} has been notified.`}
          </p>
        </div>

        <dl className="w-full rounded-card bg-surface shadow-card p-5 text-left text-[0.95rem]">
          <div className="flex justify-between py-1">
            <dt className="text-ink-soft">Contribution</dt>
            <dd className="font-bold text-ink tnum">{formatZAR(receipt.amountCents)}</dd>
          </div>
          {receipt.feeCents > 0 && (
            <div className="flex justify-between py-1">
              <dt className="text-ink-soft">Processing fee</dt>
              <dd className="text-ink tnum">{formatZAR(receipt.feeCents)}</dd>
            </div>
          )}
          {receipt.tipCents > 0 && (
            <div className="flex justify-between py-1">
              <dt className="text-ink-soft">Tip to MseeZee</dt>
              <dd className="text-ink tnum">{formatZAR(receipt.tipCents)}</dd>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-line pt-3">
            <dt className="font-bold text-ink">Total</dt>
            <dd className="text-lg font-extrabold text-ink tnum">
              {formatZAR(receipt.totalChargedCents)}
            </dd>
          </div>
        </dl>

        <div className="flex w-full flex-col gap-3">
          <ShareCircle
            circle={circle}
            framed={false}
            message={circleSupporterMessage(circle)}
            heading={`Help ${beneficiaryShort} reach more people`}
            subheading="Share the circle with your family, church or street group."
          />
          <ButtonLink href={`/circles/${circle.slug}`} variant="secondary" className="mt-2 w-full">
            Back to the circle
          </ButtonLink>
          <Link
            href="/"
            onClick={() => clearContribution(circle.slug)}
            className="link mt-2 self-center"
          >
            Find another cause near you
          </Link>
        </div>
      </div>
    </div>
  );
}
