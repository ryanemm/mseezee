"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Circle, ContributionReceipt } from "@mseezee/shared";
import { formatZAR } from "@mseezee/shared";
import { ButtonLink } from "@/components/ui/Button";
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
    return <p className="px-4 py-10 text-center text-sm text-ink-faint">…</p>;
  }

  const beneficiaryShort = circle.beneficiaryName.replace(" family", "");
  const shareText = `I just supported ${circle.title} on MseeZee. Every bit helps ${beneficiaryShort} — please add yours:`;
  const shareUrl = `https://mseezee.co.za/circles/${circle.slug}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(
    `${shareText} ${shareUrl}`,
  )}`;

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-10 text-center">
      <div
        className={`flex size-16 items-center justify-center rounded-full ${
          pending ? "bg-gold-soft text-gold" : "bg-good/15 text-good"
        }`}
      >
        {pending ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" />
            <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m5 13 4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl">
          {pending ? "Almost there" : "Ngiyabonga. Thank you."}
        </h1>
        <p className="text-sm text-ink-soft">
          {pending
            ? `We're confirming your ${formatZAR(
                receipt.amountCents,
              )} with the bank. Your receipt follows by email once it clears.`
            : `Your ${formatZAR(receipt.amountCents)} is on its way to ${
                circle.proxyName ?? circle.beneficiaryName
              }. ${circle.organiserName} has been notified.`}
        </p>
      </div>

      <dl className="w-full max-w-xs rounded-card border border-line bg-surface p-4 text-left text-sm shadow-card">
        <div className="flex justify-between py-1">
          <dt className="text-ink-faint">Contribution</dt>
          <dd className="font-semibold text-ink tnum">
            {formatZAR(receipt.amountCents)}
          </dd>
        </div>
        {receipt.feeCents > 0 && (
          <div className="flex justify-between py-1">
            <dt className="text-ink-faint">Processing fee</dt>
            <dd className="text-ink-soft tnum">{formatZAR(receipt.feeCents)}</dd>
          </div>
        )}
        {receipt.tipCents > 0 && (
          <div className="flex justify-between py-1">
            <dt className="text-ink-faint">Tip to MseeZee</dt>
            <dd className="text-ink-soft tnum">{formatZAR(receipt.tipCents)}</dd>
          </div>
        )}
        <div className="mt-1 flex justify-between border-t border-line pt-2">
          <dt className="font-semibold text-ink">Total</dt>
          <dd className="font-bold text-ink tnum">
            {formatZAR(receipt.totalChargedCents)}
          </dd>
        </div>
      </dl>

      <div className="flex w-full max-w-xs flex-col gap-2.5">
        <p className="text-sm font-semibold text-ink">
          Help {beneficiaryShort} reach more people
        </p>
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"
        >
          Share on WhatsApp
        </a>
        <ButtonLink
          href={`/circles/${circle.slug}`}
          variant="secondary"
          className="w-full"
        >
          Back to the circle
        </ButtonLink>
        <Link
          href="/"
          onClick={() => clearContribution(circle.slug)}
          className="pt-1 text-sm font-semibold text-forest"
        >
          Find another cause near you
        </Link>
      </div>
    </div>
  );
}
