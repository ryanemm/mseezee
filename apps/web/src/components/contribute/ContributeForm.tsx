"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Circle, ContributionDraft } from "@mseezee/shared";
import {
  MIN_CONTRIBUTION_CENTS,
  estimateFeeCents,
  formatZAR,
  parseRandInput,
} from "@mseezee/shared";
import { Button } from "@/components/ui/Button";
import { LockIcon } from "@/components/ui/Icons";
import { Watermark } from "@/components/ui/Watermark";
import { saveDraft } from "@/lib/draft";
import { CircleSummary } from "./CircleSummary";

const PRESETS_CENTS = [5_000, 10_000, 20_000, 50_000, 100_000];
const TIP_OPTIONS = [0, 0.05, 0.1, 0.15];
/** Unselected amount tiles take turns through the deep palette; the chosen
 *  one turns lime. */
const TILE_COLOURS = [
  "bg-night text-on-night",
  "bg-[#4b4f4b] text-white",
  "bg-funeral text-white",
  "bg-forest text-white",
  "bg-plum text-white",
  "bg-clay text-white",
];

const inputClass =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-[0.95rem] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none disabled:bg-surface-sunk disabled:text-ink-faint";

/** Rands without the ".00", but never hiding real cents. */
function zar(cents: number): string {
  return formatZAR(cents, { withDecimals: cents % 100 !== 0 });
}

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
  const amountError = amountCents < MIN_CONTRIBUTION_CENTS;

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
      className="flex flex-col gap-8 px-5 pb-48 pt-6"
      onSubmit={(e) => {
        e.preventDefault();
        onContinue();
      }}
    >
      <CircleSummary circle={circle} />

      {/* Amount */}
      <section className="flex flex-col gap-4">
        <h2 id="amount-heading" className="text-[1.4rem] font-bold">
          Choose an amount
        </h2>
        <div
          role="radiogroup"
          aria-labelledby="amount-heading"
          className="rail -mx-5 gap-3 px-5 py-1"
        >
          {PRESETS_CENTS.map((cents, i) => (
            <AmountTile
              key={cents}
              selected={!isCustom && amountCents === cents}
              colour={TILE_COLOURS[i % TILE_COLOURS.length] ?? ""}
              onSelect={() => selectPreset(cents)}
            >
              {formatZAR(cents)}
            </AmountTile>
          ))}
          <AmountTile
            selected={isCustom}
            colour={TILE_COLOURS[PRESETS_CENTS.length % TILE_COLOURS.length] ?? ""}
            onSelect={() => {
              setIsCustom(true);
              setAmountCents(parseRandInput(customValue));
            }}
          >
            Other
          </AmountTile>
        </div>
        {isCustom && (
          <div className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-surface px-4 py-3">
            <span className="text-2xl font-extrabold text-ink-faint">R</span>
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              value={customValue}
              onChange={(e) => onCustomChange(e.target.value)}
              placeholder="Enter an amount"
              aria-label="Amount in rand"
              className="w-full bg-transparent text-2xl font-extrabold text-ink placeholder:text-lg placeholder:font-semibold placeholder:text-ink-faint focus:outline-none"
            />
          </div>
        )}
        {amountError && (
          <p className="text-sm text-crit">
            The smallest contribution is {formatZAR(MIN_CONTRIBUTION_CENTS)}.
          </p>
        )}
      </section>

      {/* Identity */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[1.4rem] font-bold">Your details</h2>
        <label className="flex flex-col gap-2">
          <span className="font-semibold text-ink">Your name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={anonymous}
            placeholder={anonymous ? "Hidden — you're giving anonymously" : "e.g. Thandi M."}
            className={inputClass}
          />
          {nameError && (
            <span className="text-sm text-crit">
              Add a name, or choose to give anonymously.
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-semibold text-ink">
            Message to the family{" "}
            <span className="font-normal text-ink-soft">(optional)</span>
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            rows={2}
            placeholder="Words of comfort or support"
            className={`resize-none ${inputClass}`}
          />
          <span className="self-end text-xs text-ink-faint tnum">{message.length}/200</span>
        </label>

        <div className="flex flex-col divide-y divide-line rounded-3xl bg-surface-sunk">
          <Toggle label="Show my contribution amount" checked={showAmount} onChange={setShowAmount} />
          <Toggle
            label={`Show that I'm from ${circle.area.name}`}
            hint="Local support builds trust in a circle"
            checked={showArea}
            onChange={setShowArea}
          />
          <Toggle label="Give anonymously" checked={anonymous} onChange={setAnonymous} />
          <Toggle
            label={`Cover the ${zar(estimateFeeCents(amountCents))} processing fee`}
            hint={`So ${beneficiaryShort} receives your full ${zar(amountCents)}.`}
            checked={coverFee}
            onChange={setCoverFee}
          />
        </div>
      </section>

      {/* Tip */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 id="tip-heading" className="text-[1.4rem] font-bold">
            Tip MseeZee
          </h2>
          <p className="mt-1 text-ink-soft">
            Optional. MseeZee charges families nothing — tips from contributors keep it running.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-labelledby="tip-heading"
          className="flex rounded-full bg-surface-sunk p-1.5"
        >
          {TIP_OPTIONS.map((rate) => {
            const selected = tipRate === rate;
            const cents = Math.round(amountCents * rate);
            return (
              <button
                key={rate}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={rate === 0 ? "No tip" : `${rate * 100}% tip`}
                onClick={() => setTipRate(rate)}
                className={`flex-1 rounded-full py-3 text-[1rem] font-semibold transition-colors tnum ${
                  selected ? "bg-night text-on-night" : "text-ink-soft hover:text-ink"
                }`}
              >
                {rate === 0 ? "No tip" : amountError ? `${rate * 100}%` : zar(cents)}
              </button>
            );
          })}
        </div>
      </section>

      {/* Summary */}
      <dl className="flex flex-col gap-2 rounded-3xl border border-line p-5 text-[0.95rem]">
        <Row label={`Contribution to ${beneficiaryShort}`} value={zar(amountCents)} />
        {coverFee && <Row label="Processing fee" value={zar(feeCents)} muted />}
        {tipCents > 0 && <Row label="Tip to MseeZee" value={zar(tipCents)} muted />}
        <div className="mt-1 border-t border-line pt-3">
          <Row label="You pay" value={zar(totalCents)} strong />
        </div>
      </dl>

      {/* Continue */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 backdrop-blur md:left-64">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
          <p className="flex items-center justify-center gap-2 text-center text-[0.88rem] text-ink-soft">
            <LockIcon className="size-[18px] shrink-0" />
            <span>
              Your {zar(amountCents)} goes to {circle.proxyName ?? circle.beneficiaryName}, not to
              MseeZee.
            </span>
          </p>
          <Button type="submit" disabled={amountError || nameError} className="h-16 w-full text-[1.05rem]">
            Continue
            <span className="font-medium opacity-70 tnum">· {zar(totalCents)}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}

function AmountTile({
  selected,
  colour,
  onSelect,
  children,
}: {
  selected: boolean;
  colour: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`relative flex h-[7.5rem] w-[8.25rem] shrink-0 flex-col justify-between overflow-hidden rounded-[26px] p-4 text-left transition-transform active:scale-[0.98] ${
        selected ? "bg-lime text-on-lime ring-2 ring-ink ring-offset-2 ring-offset-surface" : colour
      }`}
    >
      {selected && <Watermark />}
      <span
        className={`relative flex size-7 items-center justify-center rounded-full border-2 ${
          selected ? "border-on-lime bg-on-lime" : "border-current opacity-60"
        }`}
        aria-hidden="true"
      >
        {selected && <span className="size-3 rounded-full bg-lime" />}
      </span>
      <span className="relative whitespace-nowrap text-[1.7rem] font-extrabold leading-none tracking-tight tnum">
        {children}
      </span>
    </button>
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
    <label className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4">
      <span className="text-[0.95rem] font-medium text-ink">
        {label}
        {hint && <span className="block text-[0.82rem] font-normal text-ink-soft">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-[3.25rem] shrink-0 rounded-full transition-colors ${
          checked ? "bg-night" : "bg-line"
        }`}
      >
        <span
          className={`absolute left-0 top-1 size-6 rounded-full shadow transition-transform ${
            checked ? "translate-x-[1.5rem] bg-lime" : "translate-x-1 bg-surface"
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
      <dt className={muted ? "text-ink-faint" : strong ? "font-bold text-ink" : "text-ink-soft"}>
        {label}
      </dt>
      <dd className={`tnum ${strong ? "text-lg font-extrabold text-ink" : "font-semibold text-ink"}`}>
        {value}
      </dd>
    </div>
  );
}
