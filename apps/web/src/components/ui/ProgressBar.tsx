import { formatZAR, progressPercent } from "@mseezee/shared";

export function ProgressBar({
  raisedCents,
  goalCents,
  supporterCount,
  compact = false,
  tone = "forest",
}: {
  raisedCents: number;
  goalCents: number;
  supporterCount?: number;
  compact?: boolean;
  tone?: "forest" | "gold";
}) {
  const pct = progressPercent(raisedCents, goalCents);
  const barColor = tone === "gold" ? "var(--gold-line)" : "var(--forest-bright)";

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress towards goal"
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.max(pct, 2)}%`, background: barColor }}
        />
      </div>
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
    </div>
  );
}
