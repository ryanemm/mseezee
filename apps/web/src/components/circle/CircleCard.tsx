import Link from "next/link";
import type { Circle } from "@mseezee/shared";
import { CoverArt } from "@/components/ui/CoverArt";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DistanceChip, TypeChip, VerifiedChip } from "@/components/ui/Chip";
import { eventDateLabel } from "@/lib/format";

export function CircleCard({
  circle,
  featured = false,
}: {
  circle: Circle;
  /** The hero treatment for "needs support now" — taller cover, gold hairline. */
  featured?: boolean;
}) {
  const areaLabel = circle.areaSection
    ? `${circle.area.name} · ${circle.areaSection}`
    : circle.area.name;

  return (
    <Link
      href={`/circles/${circle.slug}`}
      className={`group block overflow-hidden rounded-[24px] border bg-surface shadow-card transition-transform active:scale-[0.99] ${
        featured ? "border-gold-line/60" : "border-line"
      }`}
    >
      <div className={`relative ${featured ? "h-48" : "h-32"}`}>
        <CoverArt cover={circle.cover} className="h-full w-full" />
        <div className="absolute left-3.5 top-3.5">
          <TypeChip type={circle.type} onDark />
        </div>
        {circle.type === "funeral" && circle.eventDate && (
          <div className="absolute bottom-3.5 left-3.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-inset ring-white/10 backdrop-blur">
            Service {eventDateLabel(circle.eventDate)}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <DistanceChip distanceKm={circle.distanceKm} areaName={areaLabel} />
          <VerifiedChip tier={circle.verificationTier} />
        </div>

        <h3 className="font-display text-[1.15rem] font-semibold leading-snug text-ink">
          {circle.title}
        </h3>
        <p className="-mt-1.5 text-sm text-ink-soft">{circle.summary}</p>

        <ProgressBar
          raisedCents={circle.raisedCents}
          goalCents={circle.goalCents}
          supporterCount={circle.supporterCount}
          compact
        />
      </div>
    </Link>
  );
}
