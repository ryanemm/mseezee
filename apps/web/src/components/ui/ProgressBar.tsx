import { formatZAR, progressPercent } from "@mseezee/shared";

export function ProgressBar({
  raisedCents,
  goalCents,
  supporterCount,
  compact = false,
  tone = "forest",
  hideLabels = false,
}: {
  raisedCents: number;
  goalCents: number;
  supporterCount?: number;
  compact?: boolean;
  tone?: "forest" | "gold";
  /** Bar only — for places that already say the numbers in words. */
  hideLabels?: boolean;
}) {
  const pct = progressPercent(raisedCents, goalCents);
  // Forest deepening into gold reads as "warming up towards the goal".
  const fill =
    tone === "gold"
      ? "var(--gold-line)"
      : "linear-gradient(90deg, var(--forest) 0%, var(--forest-bright) 45%, var(--gold-line) 100%)";

  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-line/80 shadow-[inset_0_1px_2px_rgba(27,36,29,0.08)]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress towards goal"
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.max(pct, 3)}%`, background: fill }}
        />
      </div>
      {!hideLabels && (
        <div
          className={`flex items-baseline justify-between ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          <span className="font-semibold text-ink tnum">
            {formatZAR(raisedCents, { compact })}
            <span className="font-normal text-ink-faint">
              {" "}
              of {formatZAR(goalCents, { compact })}
            </span>
          </span>
          {supporterCount !== undefined && (
            <span className="text-ink-faint tnum">
              {supporterCount} {supporterCount === 1 ? "supporter" : "supporters"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
