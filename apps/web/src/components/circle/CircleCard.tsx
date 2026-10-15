import Link from "next/link";
import type { Circle } from "@mseezee/shared";
import { formatZAR, progressPercent } from "@mseezee/shared";
import { CoverArt } from "@/components/ui/CoverArt";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CountUp, ProgressFill } from "@/components/ui/CountUp";
import { ExampleChip, TypeChip, VerifiedChip } from "@/components/ui/Chip";
import { ArrowRightIcon, PinIcon } from "@/components/ui/Icons";
import { eventDateLabel } from "@/lib/format";

function placeLine(circle: Circle): string {
  return circle.areaSection
    ? `${circle.area.name} · ${circle.areaSection}`
    : circle.area.name;
}

function distanceLine(circle: Circle): string {
  if (circle.distanceKm === undefined) return placeLine(circle);
  if (circle.distanceKm === 0) return `${circle.area.name} · your area`;
  return `${circle.distanceKm} km away`;
}

/** The compact card: cover on top, title, where, supporters, and progress. */
export function CircleCard({ circle }: { circle: Circle }) {
  const pct = progressPercent(circle.raisedCents, circle.goalCents);

  return (
    <Link
      href={`/circles/${circle.slug}`}
      className="flex h-full flex-col gap-3.5 rounded-card bg-surface p-3 pb-5 shadow-card transition-transform active:scale-[0.99]"
    >
      <div className="relative h-36 overflow-hidden rounded-[22px]">
        <CoverArt cover={circle.cover} className="h-full w-full" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <TypeChip type={circle.type} onDark />
          {circle.verificationTier !== "unverified" && (
            <VerifiedChip tier={circle.verificationTier} />
          )}
          {circle.isDemo && <ExampleChip onDark />}
        </div>
        {circle.type === "funeral" && circle.eventDate && (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            Service {eventDateLabel(circle.eventDate)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-2">
        {/* Exactly two lines each of title and description and one of
            detail, so every card in a row or grid comes out the same height. */}
        <h3 className="line-clamp-2 min-h-[2lh] text-[1.2rem] font-bold leading-snug tracking-tight text-ink">
          {circle.title}
        </h3>
        <p className="line-clamp-2 min-h-[2lh] text-[0.92rem] leading-snug text-ink-soft">
          {circle.summary}
        </p>
        <p className="truncate text-[0.92rem] text-ink-soft tnum">
          {distanceLine(circle)} · {circle.supporterCount}{" "}
          {circle.supporterCount === 1 ? "supporter" : "supporters"}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-1.5">
          <div className="flex-1">
            <ProgressBar raisedCents={circle.raisedCents} goalCents={circle.goalCents} hideLabels />
          </div>
          <span className="text-[0.92rem] font-bold text-ink tnum">
            <CountUp value={pct} format="percent" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** The square home-feed card: full-bleed cover art with the essentials laid
 *  over it. The whole card is the link; the arrow disc just says so. */
export function FeaturedCircleCard({ circle }: { circle: Circle }) {
  const pct = progressPercent(circle.raisedCents, circle.goalCents);
  const funeralDate = circle.type === "funeral" ? circle.eventDate : undefined;

  return (
    // Square, but allowed to grow if a narrow column can't fit the content —
    // so the cover and overlay clip themselves rather than the card.
    <Link
      href={`/circles/${circle.slug}`}
      className="relative flex aspect-square h-full flex-col justify-between gap-4 rounded-[28px] p-5 text-white shadow-lift transition-transform active:scale-[0.99]"
    >
      <CoverArt cover={circle.cover} className="absolute inset-0 rounded-[inherit]" />
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-t from-black/85 via-black/35 to-black/5" />

      <div className="relative flex flex-wrap items-center gap-1.5">
        <TypeChip type={circle.type} onDark compact />
        <VerifiedChip tier={circle.verificationTier} onDark compact />
        {circle.isDemo && <ExampleChip onDark compact />}
      </div>

      <div className="relative flex flex-col gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-[0.82rem] font-medium text-white/80">
          {funeralDate ? (
            <span className="truncate">Service {eventDateLabel(funeralDate)}</span>
          ) : (
            <>
              <PinIcon className="size-4 shrink-0" />
              <span className="truncate">{placeLine(circle)}</span>
            </>
          )}
        </p>
        <h3 className="line-clamp-2 text-[1.4rem] font-extrabold leading-[1.08] tracking-[-0.025em] text-white">
          {circle.title}
        </h3>
        <p className="line-clamp-2 text-[0.85rem] leading-snug text-white/70">{circle.summary}</p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress towards goal">
          <ProgressFill pct={pct} className={circle.type === "funeral" ? "bg-gold-line" : "bg-lime"} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-[0.88rem] text-white/75 tnum">
            <span className="font-bold text-white">
              <CountUp value={circle.raisedCents} />
            </span>{" "}
            of{" "}
            {formatZAR(circle.goalCents)}
          </p>
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-[#151815]"
          >
            <ArrowRightIcon className="size-[18px]" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** The small horizontally-scrolling tile — a profile's own circles. */
export function CircleTile({
  circle,
  href,
  raisedCents = circle.raisedCents,
}: {
  circle: Circle;
  href: string;
  raisedCents?: number;
}) {
  const pct = progressPercent(raisedCents, circle.goalCents);
  return (
    <Link
      href={href}
      className="relative flex h-44 w-56 shrink-0 flex-col justify-end gap-1 overflow-hidden rounded-[28px] p-5 text-white shadow-lift"
    >
      <CoverArt cover={circle.cover} className="absolute inset-0 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <p className="relative line-clamp-2 text-[1.05rem] font-bold leading-snug">{circle.title}</p>
      <p className="relative text-sm text-white/80 tnum">
        <CountUp value={raisedCents} format="zarCompact" /> of{" "}
        {formatZAR(circle.goalCents, { compact: true })}
      </p>
      <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-white/25">
        <ProgressFill pct={pct} className={circle.type === "funeral" ? "bg-gold-line" : "bg-lime"} />
      </div>
    </Link>
  );
}
