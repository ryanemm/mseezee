"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Circle, ContributionDraft, PaymentMethod } from "@mseezee/shared";
// The demo fallback below only ever needs the client-safe in-memory
// fixtures, never the server-merged `@/lib/api` (which pulls in Prisma and
// the Paystack client — fine for a server component, not for this one).
import { estimateFeeCents, formatZAR, mockApi } from "@mseezee/shared";
import { Button } from "@/components/ui/Button";
import { BankIcon, BoltIcon, CardIcon, CheckIcon, LockIcon, PhoneIcon } from "@/components/ui/Icons";
import { loadDraft, saveReceipt } from "@/lib/draft";
import { contributionBlock } from "@/lib/contributions-open";
import { CircleSummary } from "./CircleSummary";

const METHOD_ICONS: Record<string, (p: { className?: string }) => React.ReactElement> = {
  card: CardIcon,
  instant_eft: BankIcon,
  payshap: BoltIcon,
  capitec_pay: PhoneIcon,
};

/** Rands without the ".00", but never hiding real cents. */
function zar(cents: number): string {
  return formatZAR(cents, { withDecimals: cents % 100 !== 0 });
}

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
  // Not everything in the catalog is switched on at Paystack yet — see each
  // method's `available` comment in packages/shared/src/api.ts.
  const availableMethods = methods.filter((m) => m.available);
  const comingSoonMethods = methods.filter((m) => !m.available && m.comingSoon);
  const [draft, setDraft] = useState<ContributionDraft | null>(null);
  const [email, setEmail] = useState("");
  const [methodId, setMethodId] = useState(
    availableMethods.find((m) => m.recommended)?.id ?? availableMethods[0]?.id ?? "",
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
      <p className="px-5 py-10 text-center text-sm text-ink-faint">Loading…</p>
    );
  }

  const feeCents = feeFromDraft(draft);
  const totalCents = draft.amountCents + draft.tipCents + feeCents;
  const emailValid = EMAIL_RE.test(email);

  async function pay() {
    if (!draft) return;
    setError(null);

    const blocked = contributionBlock(circle);
    if (blocked) {
      setError(`${blocked}.`);
      return;
    }

    if (paymentsLive && !emailValid) {
      setError("Enter a valid email for your receipt.");
      return;
    }

    setPaying(true);

    if (!paymentsLive) {
      // Demo fallback — no keys configured.
      try {
        const receipt = await mockApi.createContribution(draft);
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
          methodId,
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
    <div className="flex flex-col gap-8 px-5 pb-48 pt-6">
      <CircleSummary circle={circle} />

      <div className="rounded-card bg-lime p-6 text-on-lime">
        <p className="font-semibold opacity-80">You&apos;re giving</p>
        <p className="mt-1 text-[2.6rem] font-extrabold leading-none tracking-tight tnum">
          {zar(totalCents)}
        </p>
        <p className="mt-2 text-[0.9rem] opacity-75">
          {zar(draft.amountCents)} contribution
          {draft.tipCents > 0 && ` · ${zar(draft.tipCents)} tip`}
          {draft.coverFee && ` · ${zar(feeCents)} fee`}
        </p>
      </div>

      {paymentsLive && (
        <label className="flex flex-col gap-2">
          <span className="text-[1.4rem] font-bold">Email for your receipt</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-2xl border border-line bg-surface px-4 py-3.5 text-[0.95rem] outline-none focus:border-ink"
          />
        </label>
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-4 text-[1.4rem] font-bold">Pay with</legend>
        {availableMethods.map((m) => {
          const Icon = METHOD_ICONS[m.id] ?? CardIcon;
          const selected = methodId === m.id;
          return (
            <label
              key={m.id}
              className={`flex cursor-pointer items-center gap-4 rounded-3xl bg-surface-sunk p-3 pr-5 transition-shadow ${
                selected ? "ring-2 ring-ink" : ""
              }`}
            >
              <input
                type="radio"
                name="method"
                value={m.id}
                checked={selected}
                onChange={() => setMethodId(m.id)}
                className="sr-only"
              />
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-ink">
                <Icon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 text-[1.05rem] font-bold text-ink">
                  {m.label}
                  {m.recommended && (
                    <span className="rounded-full bg-lime px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-on-lime">
                      Lower fees
                    </span>
                  )}
                </span>
                <span className="block text-[0.9rem] text-ink-soft">{m.blurb}</span>
              </span>
              <span
                aria-hidden="true"
                className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                  selected ? "bg-night text-lime" : "border-2 border-line"
                }`}
              >
                {selected && <CheckIcon className="size-4" />}
              </span>
            </label>
          );
        })}
        {comingSoonMethods.map((m) => {
          const Icon = METHOD_ICONS[m.id] ?? CardIcon;
          return (
            <div
              key={m.id}
              aria-disabled="true"
              className="flex items-center gap-4 rounded-3xl bg-surface-sunk p-3 pr-5 opacity-60"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-ink-soft">
                <Icon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 text-[1.05rem] font-bold text-ink">
                  {m.label}
                  <span className="rounded-full border border-ink-faint px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink-soft">
                    Coming soon
                  </span>
                </span>
                <span className="block text-[0.9rem] text-ink-soft">{m.blurb}</span>
              </span>
            </div>
          );
        })}
        {paymentsLive && (
          <p className="px-1 text-[0.82rem] text-ink-soft">
            You&apos;ll finish on Paystack&apos;s secure payment screen.
          </p>
        )}
      </fieldset>

      <p className="rounded-3xl border border-line px-5 py-4 text-[0.88rem] text-ink-soft">
        <span className="font-bold text-ink">Secure &amp; final.</span>{" "}
        Contributions are irreversible. Funds go to{" "}
        {circle.proxyName ?? circle.beneficiaryName}, not to MseeZee.
      </p>

      {error && (
        <p role="alert" className="rounded-2xl bg-crit/10 px-4 py-3 text-sm text-crit">
          {error}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 backdrop-blur md:left-64">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
          <p className="flex items-center justify-center gap-2 text-center text-[0.88rem] text-ink-soft">
            <LockIcon className="size-[18px] shrink-0" />
            <span>
              Your {zar(draft.amountCents)} goes straight to{" "}
              {circle.proxyName ?? circle.beneficiaryName}.
            </span>
          </p>
          <Button onClick={pay} disabled={paying} className="h-16 w-full text-[1.05rem]">
            {paying ? (
              "Taking you to checkout…"
            ) : (
              <>
                Give {zar(totalCents)}
                {draft.tipCents > 0 && (
                  <span className="font-medium opacity-70">· incl. {zar(draft.tipCents)} tip</span>
                )}
              </>
            )}
          </Button>
          {!paymentsLive && (
            <p className="text-center text-[0.72rem] text-ink-faint">
              Demo payment — no money moves. Add Paystack keys to run real checkout.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function feeFromDraft(draft: ContributionDraft): number {
  return draft.coverFee ? estimateFeeCents(draft.amountCents) : 0;
}
