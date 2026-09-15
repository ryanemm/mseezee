"use client";

import { useState } from "react";
import Link from "next/link";
import type { Area, CircleType, LocationPrecision } from "@mseezee/shared";
import { CIRCLE_TYPES, findCircleType, formatZAR, parseRandInput } from "@mseezee/shared";
import { Button } from "@/components/ui/Button";

export function CreateWizard({ areas }: { areas: Area[] }) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<CircleType | null>(null);
  const [areaSlug, setAreaSlug] = useState(areas[0]?.slug ?? "");
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

  const isFuneral = type === "funeral";
  const goalCents = parseRandInput(goal);

  function next() {
    setStep((s) => Math.min(s + 1, 3));
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
          areaSlug,
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
      setDone(true);
    } catch {
      setSubmitError("Could not reach the server. Check your connection.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 px-4 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-good/15 text-good">
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
        <h1 className="text-2xl">Circle created as a draft</h1>
        <p className="max-w-xs text-sm text-ink-soft">
          {isFuneral
            ? "Next, choose a verified community partner in your area to receive the funds, or verify your own details. You can share the circle now — contributions open once verification is done."
            : "Verify your identity to start collecting. Circles can raise up to R5,000 before verification."}
        </p>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button className="w-full">Start verification</Button>
          {createdSlug && (
            <Link
              href={`/circles/${createdSlug}`}
              className="pt-1 text-sm font-semibold text-forest"
            >
              View your circle
            </Link>
          )}
          <Link href="/dashboard" className="text-sm font-semibold text-forest">
            Do this later
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
          {[0, 1, 2, 3].map((i) => (
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
            People nearby will see this circle first. We only ever show the area
            publicly.
          </p>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">Area</span>
            <select
              value={areaSlug}
              onChange={(e) => setAreaSlug(e.target.value)}
              className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm font-semibold text-ink focus:outline-none"
            >
              {areas.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name} — {a.municipality}
                </option>
              ))}
            </select>
          </label>

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

          <Button onClick={next} className="w-full">
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

      {step === 3 && (
        <section className="flex flex-col gap-4">
          <h1 className="text-xl">Review</h1>
          <dl className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface text-sm shadow-card">
            <ReviewRow label="Type" value={(type && findCircleType(type)?.label) ?? "—"} />
            <ReviewRow
              label="Area"
              value={
                areas.find((a) => a.slug === areaSlug)?.name +
                (section ? ` · ${section}` : "")
              }
            />
            <ReviewRow label="Title" value={title || "—"} />
            <ReviewRow label="Receives funds" value={beneficiary || "—"} />
            <ReviewRow label="Goal" value={goalCents ? formatZAR(goalCents) : "—"} />
          </dl>

          <div className="rounded-card bg-forest/5 p-4 text-[0.82rem] text-ink-soft">
            <p className="font-semibold text-ink">What happens next</p>
            <ol className="mt-2 flex list-decimal flex-col gap-1 pl-4">
              <li>Your circle is saved as a draft.</li>
              <li>
                {isFuneral
                  ? "Choose a verified community partner to hold the funds, or verify your own details."
                  : "Verify your identity to collect above R5,000."}
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
