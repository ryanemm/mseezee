import Link from "next/link";
import type { Circle } from "@mseezee/shared";
import { CoverArt } from "@/components/ui/CoverArt";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DistanceChip, TypeChip, VerifiedChip } from "@/components/ui/Chip";
import { eventDateLabel } from "@/lib/format";

export function CircleCard({ circle }: { circle: Circle }) {
  const areaLabel = circle.areaSection
    ? `${circle.area.name} · ${circle.areaSection}`
    : circle.area.name;

  return (
    <Link
      href={`/circles/${circle.slug}`}
      className="group block overflow-hidden rounded-card border border-line bg-surface shadow-card transition-transform active:scale-[0.99]"
    >
      <div className="relative h-28">
        <CoverArt cover={circle.cover} className="h-full w-full" />
        <div className="absolute left-3 top-3">
          <TypeChip type={circle.type} onDark />
        </div>
        {circle.type === "funeral" && circle.eventDate && (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2 py-0.5 text-[0.68rem] font-medium text-white backdrop-blur">
            Service {eventDateLabel(circle.eventDate)}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <DistanceChip distanceKm={circle.distanceKm} areaName={areaLabel} />
          <VerifiedChip tier={circle.verificationTier} />
        </div>

        <h3 className="font-display text-[1.05rem] leading-snug text-ink">
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
