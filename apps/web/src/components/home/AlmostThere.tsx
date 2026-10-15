import Link from "next/link";
import type { Circle } from "@mseezee/shared";
import { formatZAR, progressPercent } from "@mseezee/shared";
import { CircleEmblem } from "@/components/ui/CoverArt";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ArrowRightIcon } from "@/components/ui/Icons";

/** A circle counts as "almost there" from this share of its goal. */
const ALMOST_THERE_PCT = 70;
const MAX_SHOWN = 3;

/** Circles close to their goal, closest first, each with what's left to
 *  raise. Renders nothing until at least one circle qualifies. */
export function AlmostThere({ circles }: { circles: Circle[] }) {
  const close = circles
    .filter((c) => c.raisedCents < c.goalCents)
    .map((c) => ({ circle: c, pct: progressPercent(c.raisedCents, c.goalCents) }))
    .filter(({ pct }) => pct >= ALMOST_THERE_PCT)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, MAX_SHOWN);

  if (close.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-[1.4rem] font-bold">Almost there</h2>
        <p className="text-ink-soft">A little more and these circles reach their goal.</p>
      </div>
      <ul className="flex flex-col divide-y divide-line rounded-card bg-surface px-5 shadow-card">
        {close.map(({ circle, pct }) => (
          <li key={circle.id}>
            <Link href={`/circles/${circle.slug}`} className="flex items-center gap-4 py-4">
              <CircleEmblem type={circle.type} />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div>
                  <p className="line-clamp-2 font-bold leading-snug text-ink">{circle.title}</p>
                  <p className="mt-0.5 text-[0.9rem] text-ink-soft tnum">
                    <span className="font-bold text-ink">
                      {formatZAR(circle.goalCents - circle.raisedCents)} to go
                    </span>{" "}
                    · {pct}%{circle.isDemo ? " · Example" : ""}
                  </p>
                </div>
                <ProgressBar
                  raisedCents={circle.raisedCents}
                  goalCents={circle.goalCents}
                  hideLabels
                />
              </div>
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-night text-on-night"
              >
                <ArrowRightIcon className="size-5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
