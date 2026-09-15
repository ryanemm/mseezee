"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Circle, ContributionDraft, PaymentMethod } from "@mseezee/shared";
import { estimateFeeCents, formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { loadDraft, saveReceipt } from "@/lib/draft";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PaymentPanel({
  circle,
  methods,
  paymentsLive,
}: {
  circle: Circle;
  methods: PaymentMethod[];
  /** Paystack keys present — run the real hosted checkout instead of the demo. */
  paymentsLive: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<ContributionDraft | null>(null);
  const [email, setEmail] = useState("");
  const [methodId, setMethodId] = useState(
    methods.find((m) => m.recommended)?.id ?? methods[0]?.id ?? "",
  );
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadDraft(circle.slug);
    if (!d) {
      router.replace(`/circles/${circle.slug}/contribute`);
      return;
    }
    setDraft(d);
  }, [circle.slug, router]);

  if (!draft) {
    return (
      <p className="px-4 py-10 text-center text-sm text-ink-faint">Loading…</p>
    );
  }

  const feeCents = feeFromDraft(draft);
  const totalCents = draft.amountCents + draft.tipCents + feeCents;
  const emailValid = EMAIL_RE.test(email);

  async function pay() {
    if (!draft) return;
    setError(null);

    if (paymentsLive && !emailValid) {
      setError("Enter a valid email for your receipt.");
      return;
    }

    setPaying(true);

    if (!paymentsLive) {
      // Demo fallback — no keys configured.
      try {
        const receipt = await api.createContribution(draft);
        saveReceipt(circle.slug, receipt);
        router.push(`/circles/${circle.slug}/contribute/done`);
      } catch {
        setPaying(false);
        setError("Something went wrong. Try again.");
      }
      return;
    }

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          circleSlug: circle.slug,
          email,
          amountCents: draft.amountCents,
          tipCents: draft.tipCents,
          coverFee: draft.coverFee,
          displayName: draft.displayName,
          message: draft.message,
          anonymous: draft.anonymous,
          showAmount: draft.showAmount,
          showArea: draft.showArea,
        }),
      });
      const data = (await res.json()) as {
        authorizationUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.authorizationUrl) {
        setPaying(false);
        setError(data.error ?? "Could not start the payment.");
        return;
      }
      window.location.href = data.authorizationUrl;
    } catch {
      setPaying(false);
      setError("Could not reach the payment service. Check your connection.");
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-5">
      <div className="rounded-card border border-line bg-surface p-4 shadow-card">
        <p className="text-sm text-ink-soft">
          Supporting{" "}
          <span className="font-semibold text-ink">{circle.beneficiaryName}</span>
        </p>
        <p className="mt-1 font-display text-3xl text-forest tnum">
          {formatZAR(totalCents)}
        </p>
        <p className="text-xs text-ink-faint">
          {formatZAR(draft.amountCents)} contribution
          {draft.tipCents > 0 && ` · ${formatZAR(draft.tipCents)} tip`}
          {draft.coverFee && ` · ${formatZAR(feeCents)} fee`}
        </p>
      </div>

      {paymentsLive && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink">
            Email for your receipt
          </span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-xl border border-line bg-surface px-3.5 py-3 text-sm outline-none focus:border-forest"
          />
        </label>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-ink">
          Choose how to pay
        </legend>
        {methods.map((m) => (
          <label
            key={m.id}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
              methodId === m.id
                ? "border-forest bg-forest/5"
                : "border-line bg-surface"
            }`}
          >
            <input
              type="radio"
              name="method"
              value={m.id}
              checked={methodId === m.id}
              onChange={() => setMethodId(m.id)}
              className="mt-0.5 size-4 accent-forest"
            />
            <span className="flex-1">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                {m.label}
                {m.recommended && (
                  <span className="rounded-full bg-good/10 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-good">
                    Lower fees
                  </span>
                )}
              </span>
              <span className="text-xs text-ink-faint">{m.blurb}</span>
            </span>
          </label>
        ))}
        {paymentsLive && (
          <p className="px-1 text-[0.72rem] text-ink-faint">
            You&apos;ll pick the exact method on the next secure screen.
          </p>
        )}
      </fieldset>

      <p className="rounded-xl bg-surface-sunk px-3 py-2.5 text-[0.78rem] text-ink-soft">
        <span className="font-semibold text-ink">Secure &amp; final.</span>{" "}
        Contributions are irreversible. Funds go to{" "}
        {circle.proxyName ?? circle.beneficiaryName}, not to MseeZee.
      </p>

      {error && (
        <p className="rounded-xl bg-crit/10 px-3 py-2.5 text-sm text-crit">
          {error}
        </p>
      )}

      <Button onClick={pay} disabled={paying} className="w-full">
        {paying ? "Taking you to checkout…" : `Pay ${formatZAR(totalCents)}`}
      </Button>
      {!paymentsLive && (
        <p className="-mt-3 text-center text-[0.7rem] text-ink-faint">
          Demo payment — no money moves. Add Paystack keys to run real checkout.
        </p>
      )}
    </div>
  );
}

function feeFromDraft(draft: ContributionDraft): number {
  return draft.coverFee ? estimateFeeCents(draft.amountCents) : 0;
}
