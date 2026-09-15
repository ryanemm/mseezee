"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Circle, ContributionDraft } from "@mseezee/shared";
import {
  estimateFeeCents,
  formatZAR,
  parseRandInput,
} from "@mseezee/shared";
import { Button } from "@/components/ui/Button";
import { saveDraft } from "@/lib/draft";

const PRESETS_CENTS = [5_000, 10_000, 20_000, 50_000, 100_000];
const TIP_OPTIONS = [0, 0.05, 0.1, 0.15];

export function ContributeForm({ circle }: { circle: Circle }) {
  const router = useRouter();
  const beneficiaryShort = circle.beneficiaryName.replace(" family", "");

  const [amountCents, setAmountCents] = useState(20_000);
  const [customValue, setCustomValue] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [showAmount, setShowAmount] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const [showArea, setShowArea] = useState(true);
  const [coverFee, setCoverFee] = useState(true);
  const [tipRate, setTipRate] = useState(0.1);

  const feeCents = useMemo(
    () => (coverFee ? estimateFeeCents(amountCents) : 0),
    [coverFee, amountCents],
  );
  const tipCents = Math.round(amountCents * tipRate);
  const totalCents = amountCents + feeCents + tipCents;

  const nameError = !anonymous && displayName.trim().length === 0;
  const amountError = amountCents < 1000;

  function selectPreset(cents: number) {
    setIsCustom(false);
    setAmountCents(cents);
  }

  function onCustomChange(value: string) {
    setCustomValue(value);
    setAmountCents(parseRandInput(value));
  }

  function onContinue() {
    if (amountError || nameError) return;
    const draft: ContributionDraft = {
      circleId: circle.id,
      amountCents,
      displayName: anonymous ? "" : displayName.trim(),
      message: message.trim(),
      anonymous,
      showAmount,
      showArea,
      coverFee,
      tipCents,
    };
    saveDraft(circle.slug, draft);
    router.push(`/circles/${circle.slug}/contribute/payment`);
  }

  return (
    <form
      className="flex flex-col gap-6 px-4 py-5"
      onSubmit={(e) => {
        e.preventDefault();
        onContinue();
      }}
    >
      <div className="rounded-card border border-line bg-surface p-3.5 text-sm shadow-card">
        You are supporting{" "}
        <span className="font-semibold text-ink">{circle.beneficiaryName}</span>{" "}
        in {circle.area.name}.
      </div>

      {/* Amount */}
      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-1 text-sm font-semibold text-ink">
          Choose your contribution
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS_CENTS.map((cents) => (
            <button
              key={cents}
              type="button"
              onClick={() => selectPreset(cents)}
              className={`rounded-xl border py-3 text-sm font-semibold transition-colors ${
                !isCustom && amountCents === cents
                  ? "border-forest bg-forest text-surface"
                  : "border-line bg-surface text-ink hover:border-ink-faint"
              }`}
            >
              {formatZAR(cents)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setIsCustom(true);
              setAmountCents(parseRandInput(customValue));
            }}
            className={`rounded-xl border py-3 text-sm font-semibold transition-colors ${
              isCustom
                ? "border-forest bg-forest text-surface"
                : "border-line bg-surface text-ink hover:border-ink-faint"
            }`}
          >
            Other
          </button>
        </div>
        {isCustom && (
          <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5">
            <span className="text-sm font-semibold text-ink-faint">R</span>
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              value={customValue}
              onChange={(e) => onCustomChange(e.target.value)}
              placeholder="Enter an amount"
              className="w-full bg-transparent text-sm font-semibold text-ink focus:outline-none"
            />
          </div>
        )}
        {amountError && (
          <p className="text-xs text-crit">
            The smallest contribution is {formatZAR(1000)}.
          </p>
        )}
      </fieldset>

      {/* Identity */}
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink">Your name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={anonymous}
            placeholder={anonymous ? "Hidden — you're giving anonymously" : "e.g. Thandi M."}
            className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none disabled:bg-surface-sunk disabled:text-ink-faint"
          />
          {nameError && (
            <span className="text-xs text-crit">
              Add a name, or choose to give anonymously.
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink">
            Message to the family{" "}
            <span className="font-normal text-ink-faint">(optional)</span>
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            rows={2}
            placeholder="Words of comfort or support"
            className="resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <span className="self-end text-[0.7rem] text-ink-faint tnum">
            {message.length}/200
          </span>
        </label>
      </div>

      {/* Toggles */}
      <div className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface shadow-card">
        <Toggle
          label="Show my contribution amount"
          checked={showAmount}
          onChange={setShowAmount}
        />
        <Toggle
          label={`Show that I'm from ${circle.area.name}`}
          hint="Local support builds trust in a circle"
          checked={showArea}
          onChange={setShowArea}
        />
        <Toggle
          label="Give anonymously"
          checked={anonymous}
          onChange={setAnonymous}
        />
      </div>

      {/* Fee */}
      <div className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={coverFee}
            onChange={(e) => setCoverFee(e.target.checked)}
            className="mt-0.5 size-4 accent-forest"
          />
          <span className="text-sm text-ink-soft">
            <span className="font-semibold text-ink">
              Cover the {formatZAR(estimateFeeCents(amountCents))} processing fee
            </span>{" "}
            so {beneficiaryShort} receives your full {formatZAR(amountCents)}.
          </span>
        </label>
      </div>

      {/* Tip */}
      <div className="flex flex-col gap-2.5 rounded-card border border-line bg-forest/5 p-4">
        <p className="text-sm font-semibold text-ink">
          Add a tip to keep MseeZee running
        </p>
        <p className="text-[0.8rem] text-ink-soft">
          MseeZee charges families nothing. Voluntary tips from contributors keep
          the platform going.
        </p>
        <div className="grid grid-cols-4 gap-2">
          {TIP_OPTIONS.map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setTipRate(rate)}
              className={`rounded-lg border py-2 text-sm font-semibold transition-colors ${
                tipRate === rate
                  ? "border-forest bg-forest text-surface"
                  : "border-line bg-surface text-ink"
              }`}
            >
              {rate === 0 ? "None" : `${rate * 100}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary + continue */}
      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <dl className="flex flex-col gap-1.5 text-sm">
          <Row label={`Contribution to ${beneficiaryShort}`} value={formatZAR(amountCents)} />
          {coverFee && <Row label="Processing fee" value={formatZAR(feeCents)} muted />}
          {tipCents > 0 && <Row label="Tip to MseeZee" value={formatZAR(tipCents)} muted />}
          <Row label="You pay" value={formatZAR(totalCents)} strong />
        </dl>
        <Button type="submit" disabled={amountError || nameError} className="w-full">
          Continue to payment
        </Button>
      </div>
    </form>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 p-3.5">
      <span className="text-sm text-ink">
        {label}
        {hint && <span className="block text-[0.75rem] text-ink-faint">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
          checked ? "bg-forest" : "bg-line"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-surface shadow transition-transform ${
            checked ? "translate-x-[1.15rem]" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={muted ? "text-ink-faint" : "text-ink-soft"}>{label}</dt>
      <dd
        className={`tnum ${
          strong ? "text-base font-bold text-ink" : "font-semibold text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
