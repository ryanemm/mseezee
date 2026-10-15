import Link from "next/link";
import type { Circle, CirclePlace } from "@mseezee/shared";
import { formatZAR, progressPercent } from "@mseezee/shared";
import { placeWhere } from "@/lib/places";
import { ButtonLink } from "@/components/ui/Button";
import { CircleEmblem } from "@/components/ui/CoverArt";
import { ChevronRightIcon, PinIcon } from "@/components/ui/Icons";

/** How many of the area's circles the preview lists. */
const PREVIEW_COUNT = 3;

/**
 * Under the home map once a place is chosen (search or a pin): what's there,
 * a few of its circles, and the way through to everything in Explore.
 */
export function AreaPreview({
  place,
  circles,
  clearHref,
}: {
  place: CirclePlace;
  /** Every circle in the area, in the order to show them. */
  circles: Circle[];
  /** The same page without the chosen place. */
  clearHref: string;
}) {
  const raised = circles.reduce((sum, c) => sum + c.raisedCents, 0);
  const shown = circles.slice(0, PREVIEW_COUNT);

  return (
    <section
      aria-label={`Circles in ${place.name}`}
      className="mz-pop flex flex-col gap-4 rounded-card bg-surface p-5 shadow-card lg:p-6"
    >
      <div className="flex items-start gap-3.5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-lime text-on-lime">
          <PinIcon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[1.3rem] font-bold">{place.name}</h2>
          <p className="truncate text-[0.88rem] text-ink-soft">{placeWhere(place)}</p>
        </div>
        <Link
          href={clearHref}
          scroll={false}
          aria-label={`Clear ${place.name}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-sunk text-ink-soft transition-colors hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </Link>
      </div>

      {circles.length > 0 ? (
        <>
          <p className="text-ink-soft tnum">
            <span className="font-bold text-ink">
              {circles.length} {circles.length === 1 ? "circle" : "circles"}
            </span>{" "}
            · {formatZAR(raised)} raised here
          </p>
          <ul className="-my-1 flex flex-col divide-y divide-line">
            {shown.map((c) => {
              const pct = progressPercent(c.raisedCents, c.goalCents);
              return (
                <li key={c.id}>
                  <Link href={`/circles/${c.slug}`} className="flex items-center gap-3.5 py-3">
                    <CircleEmblem type={c.type} className="size-12 rounded-2xl" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-ink">{c.title}</span>
                      <span className="block truncate text-[0.85rem] text-ink-soft tnum">
                        {formatZAR(c.raisedCents)} of {formatZAR(c.goalCents)} · {pct}%
                        {c.isDemo ? " · Example" : ""}
                      </span>
                    </span>
                    <ChevronRightIcon className="size-5 shrink-0 text-ink-soft" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="rounded-2xl bg-surface-sunk px-4 py-3.5 text-ink-soft">
          <span className="font-bold text-ink">No circles in {place.name} yet.</span> Know a
          family, school or project here that needs support?{" "}
          <Link href="/create" className="link">
            Start the first one
          </Link>
        </p>
      )}

      <ButtonLink href={`/explore?place=${place.id}`} className="w-full">
        {circles.length > PREVIEW_COUNT
          ? `See all ${circles.length} in ${place.name}`
          : circles.length > 0
            ? `Explore ${place.name}`
            : "Explore circles nearby"}
      </ButtonLink>
    </section>
  );
}
