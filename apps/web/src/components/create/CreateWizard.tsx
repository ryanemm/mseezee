"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CircleType, LocationPrecision } from "@mseezee/shared";
import type { PlaceSearchResult } from "@/lib/places";
import { PlaceSearch } from "@/components/place/PlaceSearch";
import { CIRCLE_TYPES, findCircleType, formatZAR, parseRandInput } from "@mseezee/shared";
import { Button, ButtonLink } from "@/components/ui/Button";

export function CreateWizard() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<CircleType | null>(null);
  const [place, setPlace] = useState<PlaceSearchResult | null>(null);
  const [section, setSection] = useState("");
  const [precision, setPrecision] = useState<LocationPrecision>("area");
  const [title, setTitle] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [goal, setGoal] = useState("");
  const [story, setStory] = useState("");
  const [done, setDone] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Payout step. Optional at creation, but a circle can't take contributions
  // until it has one, so MseeZee never ends up holding a circle's money.
  const [banks, setBanks] = useState<Bank[] | null>(null);
  const [banksError, setBanksError] = useState<string | null>(null);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [payoutSaved, setPayoutSaved] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  const isFuneral = type === "funeral";
  const goalCents = parseRandInput(goal);
  const cleanAccount = accountNumber.replace(/\s+/g, "");
  const selectedBank = banks?.find((b) => b.code === bankCode);
  const payoutEntered = Boolean(selectedBank && cleanAccount);
  const accountValid = /^\d{6,17}$/.test(cleanAccount);

  useEffect(() => {
    if (step !== PAYOUT_STEP || banks) return;
    fetch("/api/paystack/banks")
      .then((res) => res.json())
      .then((data: { banks?: Bank[]; error?: string }) => {
        if (data.banks) setBanks(data.banks);
        else setBanksError(data.error ?? "Could not load the bank list.");
      })
      .catch(() => setBanksError("Could not load the bank list."));
  }, [step, banks]);

  function next() {
    setStep((s) => Math.min(s + 1, LAST_STEP));
  }
  function skipPayout() {
    setBankCode("");
    setAccountNumber("");
    next();
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submitCircle() {
    if (!type) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/circles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim(),
          story: story.trim(),
          beneficiaryName: beneficiary.trim(),
          placeId: place?.id,
          areaSection: section.trim() || undefined,
          locationPrecision: precision,
          goalCents,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        circle?: { slug: string };
        error?: string;
      };
      if (!res.ok || !data.circle) {
        setSubmitError(data.error ?? "Could not create the circle. Try again.");
        setSubmitting(false);
        return;
      }
      setCreatedSlug(data.circle.slug);

      if (payoutEntered && selectedBank) {
        const payoutRes = await fetch(`/api/circles/${data.circle.slug}/payout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bankCode: selectedBank.code,
            bankName: selectedBank.name,
            accountNumber: cleanAccount,
          }),
        });
        const payoutData = (await payoutRes.json().catch(() => ({}))) as { error?: string };
        if (payoutRes.ok) {
          setPayoutSaved(true);
        } else {
          // The circle itself was created — don't make them redo it, just
          // send them to add the account again from the dashboard.
          setPayoutError(payoutData.error ?? "We couldn't save that bank account.");
        }
      }
      setDone(true);
    } catch {
      setSubmitError("Could not reach the server. Check your connection.");
      setSubmitting(false);
    }
  }

  if (done) {
    const open = payoutSaved;
    return (
      <div className="flex flex-col items-center gap-5 px-4 py-12 text-center">
        <div
          className={`flex size-14 items-center justify-center rounded-full ${
            open ? "bg-good/15 text-good" : "bg-gold-soft text-gold"
          }`}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m5 13 4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-2xl">{open ? "Your circle is open" : "Your circle is saved"}</h1>
        {open ? (
          <p className="max-w-xs text-sm text-ink-soft">
            Contributions go straight to the {selectedBank?.name ?? "bank"} account you
            added, paid out by our payment provider on its normal schedule. Share your
            circle to start receiving support.
          </p>
        ) : (
          <p className="max-w-xs text-sm text-ink-soft">
            {payoutError
              ? `${payoutError} `
              : ""}
            It isn&apos;t open for contributions yet. Add the bank account the money
            should go to — the beneficiary&apos;s, or the organisation holding the funds —
            and it opens straight away.
          </p>
        )}
        <div className="flex w-full max-w-xs flex-col gap-2">
          {createdSlug && !open && (
            <ButtonLink href={`/dashboard/${createdSlug}#payouts`} className="w-full">
              Add payout account
            </ButtonLink>
          )}
          {createdSlug && open && (
            <ButtonLink href={`/circles/${createdSlug}`} className="w-full">
              View and share your circle
            </ButtonLink>
          )}
          {createdSlug && (
            <ButtonLink
              href={open ? `/dashboard/${createdSlug}` : `/circles/${createdSlug}`}
              variant="secondary"
              className="w-full"
            >
              {open ? "Manage your circle" : "View public page"}
            </ButtonLink>
          )}
          <Link href="/dashboard" className="pt-1 text-sm font-semibold text-forest">
            All my circles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-5">
      <div className="flex items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            aria-label="Back"
            className="flex size-9 items-center justify-center rounded-full border border-line text-ink-soft"
          >
            <Arrow />
          </button>
        ) : (
          <Link
            href="/"
            aria-label="Cancel"
            className="flex size-9 items-center justify-center rounded-full border border-line text-ink-soft"
          >
            <Arrow />
          </Link>
        )}
        <div className="flex flex-1 gap-1">
          {Array.from({ length: LAST_STEP + 1 }, (_, i) => i).map((i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= step ? "bg-forest" : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>

      {step === 0 && (
        <section className="flex flex-col gap-3">
          <h1 className="text-xl">What are you creating?</h1>
          {CIRCLE_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setType(t.key);
                if (t.key === "funeral") setPrecision("area");
                next();
              }}
              className={`rounded-card border p-4 text-left transition-colors ${
                type === t.key
                  ? "border-forest bg-forest/5"
                  : "border-line bg-surface hover:border-ink-faint"
              }`}
            >
              <p className="font-display text-lg text-ink">{t.label}</p>
              <p className="mt-0.5 text-sm text-ink-soft">{t.blurb}</p>
            </button>
          ))}
        </section>
      )}

      {step === 1 && (
        <section className="flex flex-col gap-4">
          <h1 className="text-xl">Where is this?</h1>
          <p className="-mt-2 text-sm text-ink-soft">
            People nearby will see this circle first. Pick the suburb, township or
            town — never a street address.
          </p>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">Suburb, township or town</span>
            {place ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-forest bg-forest/5 px-3 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{place.name}</span>
                  <span className="block truncate text-xs text-ink-faint">
                    {place.kind === "sub" ? `${place.mainPlaceName} · ` : ""}
                    {place.municipality} · {place.province}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setPlace(null)}
                  className="shrink-0 text-sm font-semibold text-forest"
                >
                  Change
                </button>
              </div>
            ) : (
              <PlaceSearch onSelect={setPlace} />
            )}
            {place && isFuneral && place.kind === "sub" && (
              <span className="text-xs text-ink-faint">
                Funeral circles only show {place.mainPlaceName} publicly.
              </span>
            )}
            <span className="text-[0.7rem] text-ink-faint">
              Can&apos;t find it? Pick the nearest place and add the detail below.
            </span>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">
              Section or zone{" "}
              <span className="font-normal text-ink-faint">(optional)</span>
            </span>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. Zone 4, Site B, NU7"
              className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold text-ink">
              How much location to show
            </legend>
            {(
              [
                {
                  key: "area" as const,
                  label: "Area only",
                  hint: "Recommended. Shows the suburb or township.",
                },
                {
                  key: "hidden" as const,
                  label: "Hide location",
                  hint: "Only the province is shown.",
                },
              ]
            ).map((opt) => (
              <label
                key={opt.key}
                className={`flex items-start gap-3 rounded-xl border p-3 ${
                  precision === opt.key
                    ? "border-forest bg-forest/5"
                    : "border-line bg-surface"
                }`}
              >
                <input
                  type="radio"
                  name="precision"
                  checked={precision === opt.key}
                  onChange={() => setPrecision(opt.key)}
                  className="mt-0.5 size-4 accent-forest"
                />
                <span className="text-sm">
                  <span className="font-semibold text-ink">{opt.label}</span>
                  <span className="block text-xs text-ink-faint">{opt.hint}</span>
                </span>
              </label>
            ))}
            {isFuneral && (
              <p className="rounded-lg bg-surface-sunk px-3 py-2 text-[0.76rem] text-ink-soft">
                For funerals we never show a street address — publishing one next
                to a running total is a safety risk.
              </p>
            )}
          </fieldset>

          <Button onClick={next} disabled={!place} className="w-full">
            Continue
          </Button>
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-4">
          <h1 className="text-xl">The basics</h1>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">Circle title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isFuneral
                  ? "In loving memory of…"
                  : type === "family"
                    ? "e.g. A new roof for Gogo Mthembu"
                    : type === "essentials"
                      ? "e.g. Uniforms for Phase 4 learners"
                      : "e.g. Dlomo Street lighting"
              }
              className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">
              Who receives the funds
            </span>
            <input
              type="text"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              placeholder="Family name, or the committee / organisation"
              className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">Goal amount</span>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5">
              <span className="text-sm font-semibold text-ink-faint">R</span>
              <input
                type="text"
                inputMode="decimal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="50 000"
                className="w-full bg-transparent text-sm font-semibold text-ink focus:outline-none"
              />
            </div>
            {goalCents > 0 && (
              <span className="text-xs text-ink-faint">
                Goal: {formatZAR(goalCents)}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">
              Tell the story
            </span>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value.slice(0, 600))}
              rows={4}
              placeholder="What happened, who it helps, what the money covers."
              className="resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <span className="self-end text-[0.7rem] text-ink-faint tnum">
              {story.length}/600
            </span>
          </label>

          <Button
            onClick={next}
            disabled={!title.trim() || !beneficiary.trim() || goalCents < 1000}
            className="w-full"
          >
            Continue
          </Button>
        </section>
      )}

      {step === PAYOUT_STEP && (
        <section className="flex flex-col gap-4">
          <h1 className="text-xl">Where the money goes</h1>
          <p className="-mt-2 text-sm text-ink-soft">
            Contributions settle straight into this account — the beneficiary&apos;s own,
            or the organisation holding the funds for them. MseeZee never holds the
            money. You can skip this for now, but the circle won&apos;t take
            contributions until it&apos;s added.
          </p>

          {banksError && (
            <p className="rounded-xl bg-crit/10 px-3 py-2.5 text-sm text-crit">{banksError}</p>
          )}
          {!banks && !banksError && <p className="text-sm text-ink-faint">Loading banks…</p>}

          {banks && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink">Bank</span>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm font-semibold text-ink focus:outline-none"
                >
                  <option value="">Choose a bank</option>
                  {banks.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink">Account number</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 62012345678"
                  className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                />
                {cleanAccount && !accountValid && (
                  <span className="text-xs text-crit">Enter digits only, 6 to 17 of them.</span>
                )}
              </label>

              <p className="rounded-lg bg-surface-sunk px-3 py-2 text-[0.76rem] text-ink-soft">
                Double-check the account number — contributions are paid straight into
                this account, so it should belong to the beneficiary or the
                organisation holding the funds for them.
              </p>
            </>
          )}

          <Button
            onClick={next}
            disabled={!selectedBank || !accountValid}
            className="w-full"
          >
            Continue
          </Button>
          <button
            type="button"
            onClick={skipPayout}
            className="text-sm font-semibold text-forest"
          >
            Skip for now
          </button>
        </section>
      )}

      {step === REVIEW_STEP && (
        <section className="flex flex-col gap-4">
          <h1 className="text-xl">Review</h1>
          <dl className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface text-sm shadow-card">
            <ReviewRow label="Type" value={(type && findCircleType(type)?.label) ?? "—"} />
            <ReviewRow
              label="Where"
              value={
                place
                  ? (place.kind === "sub" ? `${place.name}, ${place.mainPlaceName}` : place.name) +
                    (section ? ` · ${section}` : "")
                  : "—"
              }
            />
            <ReviewRow label="Title" value={title || "—"} />
            <ReviewRow label="Receives funds" value={beneficiary || "—"} />
            <ReviewRow label="Goal" value={goalCents ? formatZAR(goalCents) : "—"} />
            <ReviewRow
              label="Payout account"
              value={
                payoutEntered && selectedBank
                  ? `${selectedBank.name} · ••••${cleanAccount.slice(-4)}`
                  : "Not added yet"
              }
            />
          </dl>

          <div className="rounded-card bg-forest/5 p-4 text-[0.82rem] text-ink-soft">
            <p className="font-semibold text-ink">What happens next</p>
            <ol className="mt-2 flex list-decimal flex-col gap-1 pl-4">
              {payoutEntered ? (
                <li>Your circle opens for contributions as soon as it&apos;s created.</li>
              ) : (
                <li>
                  Your circle is saved, but won&apos;t take contributions until you add a
                  payout account from its dashboard.
                </li>
              )}
              <li>
                Contributions are paid straight into the account you added, on our
                payment provider&apos;s normal schedule.
              </li>
              <li>Share your circle link and start receiving support.</li>
            </ol>
          </div>

          {submitError && (
            <p className="rounded-xl bg-crit/10 px-3 py-2.5 text-sm text-crit">
              {submitError}
            </p>
          )}

          <Button onClick={submitCircle} disabled={submitting} className="w-full">
            {submitting ? "Creating…" : "Create circle"}
          </Button>
        </section>
      )}
    </div>
  );
}

const PAYOUT_STEP = 3;
const REVIEW_STEP = 4;
const LAST_STEP = REVIEW_STEP;

interface Bank {
  name: string;
  code: string;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 p-3.5">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m15 5-7 7 7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
