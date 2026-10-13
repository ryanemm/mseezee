import { formatZAR, progressPercent } from "@mseezee/shared";

const FILLS = {
  // Black on a light track — the default on white and grey surfaces.
  ink: { track: "bg-line", fill: "bg-night" },
  // Lime on a translucent track — on dark cover art.
  lime: { track: "bg-white/20", fill: "bg-lime" },
  // Candle amber — funeral tiles.
  gold: { track: "bg-white/20", fill: "bg-gold-line" },
};

export function ProgressBar({
  raisedCents,
  goalCents,
  supporterCount,
  compact = false,
  tone = "ink",
  hideLabels = false,
  thick = false,
}: {
  raisedCents: number;
  goalCents: number;
  supporterCount?: number;
  compact?: boolean;
  tone?: keyof typeof FILLS;
  /** Bar only — for places that already say the numbers in words. */
  hideLabels?: boolean;
  thick?: boolean;
}) {
  const pct = progressPercent(raisedCents, goalCents);
  const { track, fill } = FILLS[tone];
  const onDark = tone !== "ink";

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`w-full overflow-hidden rounded-full ${thick ? "h-3.5" : "h-2.5"} ${track}`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress towards goal"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${fill}`}
          style={{ width: `${Math.max(pct, 3)}%` }}
        />
      </div>
      {!hideLabels && (
        <div
          className={`flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 ${
            compact ? "text-[0.8rem]" : "text-[0.95rem]"
          } ${onDark ? "text-white" : "text-ink"}`}
        >
          <span className="whitespace-nowrap font-bold tnum">
            {formatZAR(raisedCents, { compact })}
            <span className={`font-medium ${onDark ? "text-white/80" : "text-ink-soft"}`}>
              {" "}
              of {formatZAR(goalCents, { compact })}
            </span>
          </span>
          {supporterCount !== undefined && (
            <span className={`whitespace-nowrap tnum ${onDark ? "text-white/85" : "text-ink-soft"}`}>
              {supporterCount} {supporterCount === 1 ? "supporter" : "supporters"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
