import type { Metadata } from "next";
import Link from "next/link";
import { PLACE_DATA_CREDIT, distanceKm, formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { circlesIn, getPlace, placeWhere, summarisePlaces } from "@/lib/places";
import { AreaMap } from "@/components/layout/AreaMap";
import { CircleCard } from "@/components/circle/CircleCard";
import { FindNearMeButton } from "@/components/circle/FindNearMeButton";
import { Pill } from "@/components/ui/Pill";
import { ExplorePlaceSearch } from "@/components/place/ExplorePlaceSearch";
import { BackLink } from "@/components/ui/IconButton";
import { ButtonLink, SeeAllLink } from "@/components/ui/Button";
import { ChevronRightIcon, PlusIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Explore places",
  description: "Search community causes by suburb, township or town across South Africa.",
};

type Search = {
  province?: string;
  lat?: string;
  lng?: string;
  /** A chosen place: the map zooms to it and the sheet lists all its circles. */
  place?: string;
};

/** How many of the closest circles the sheet shows in "near me" mode. */
const NEAR_COUNT = 8;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const near = parseNear(sp.lat, sp.lng);
  const [all, focusPlace] = await Promise.all([
    api.listCircles({ sort: "most_supported" }),
    sp.place ? getPlace(sp.place) : null,
  ]);
  // Only places that actually have circles are listed; anything else is
  // reachable through search, where its page says it has none yet.
  const areas = summarisePlaces(all);

  const provinces = [...new Set(areas.map((a) => a.province))].sort();
  const province = provinces.includes(sp.province ?? "") ? sp.province : undefined;
  const visible = province ? areas.filter((a) => a.province === province) : areas;

  const closest = near
    ? all
        .map((c) => ({ ...c, distanceKm: distanceKm(near, c.area) }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, NEAR_COUNT)
    : [];

  // A chosen place: all its circles, or — if it has none — the nearest ones.
  const inFocus = focusPlace ? circlesIn(all, focusPlace.id) : [];
  const nearestToFocus =
    focusPlace && inFocus.length === 0
      ? all
          .map((c) => ({ ...c, distanceKm: distanceKm(focusPlace, c.area) }))
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, 4)
      : [];
  const focusRaised = inFocus.reduce((sum, c) => sum + c.raisedCents, 0);
  const focusSupporters = inFocus.reduce((sum, c) => sum + c.supporterCount, 0);
  const focus = focusPlace
    ? {
        id: focusPlace.id,
        lat: focusPlace.lat,
        lng: focusPlace.lng,
        name: focusPlace.name,
        raisedCents: inFocus.length > 0 ? focusRaised : null,
      }
    : null;

  // The big lime pin: the closest place in "near me" mode, otherwise the one
  // that has raised the most. A chosen place gets its own labelled tag.
  const highlightId = focusPlace
    ? undefined
    : near
      ? closest[0]?.area.id
      : [...visible].sort((a, b) => b.raisedCents - a.raisedCents)[0]?.id;

  const nearParams = near ? `lat=${near.lat}&lng=${near.lng}` : "";

  return (
    // The sheet runs under the bottom nav's clearance (the negative margin
    // matches BottomNav's spacer) so the page ends in the sheet, not a gap.
    <div className="-mb-[calc(4.5rem+env(safe-area-inset-bottom))] flex flex-col md:mx-auto md:mb-0 md:w-full md:max-w-6xl md:px-10 md:pt-8">
      <div className="relative h-[62dvh] min-h-[26rem] md:h-[30rem] md:overflow-hidden md:rounded-card md:shadow-lift">
        <AreaMap
          places={focusPlace ? areas : visible}
          near={near}
          highlightId={highlightId}
          focus={focus}
          frame={province ? "places" : "country"}
          className="absolute inset-0"
        />

        <div className="absolute inset-x-0 top-0 z-30 flex flex-col gap-3 px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] md:px-6 md:pt-6">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <BackLink href="/" shape="round" />
            </div>
            <div className="min-w-0 flex-1 md:max-w-lg">
              <ExplorePlaceSearch mode="explore" floating />
            </div>
          </div>
          <div className="rail -mx-5 gap-2.5 px-5 md:mx-0 md:px-0">
            <Pill href={near ? `/explore?${nearParams}` : "/explore"} active={!province} count={areas.length}>
              All provinces
            </Pill>
            {provinces.map((p) => (
              <Pill
                key={p}
                href={`/explore?province=${encodeURIComponent(p)}${near ? `&${nearParams}` : ""}`}
                active={province === p}
                count={areas.filter((a) => a.province === p).length}
              >
                {p}
              </Pill>
            ))}
          </div>
        </div>

        <div className="absolute bottom-14 right-5 z-20 md:bottom-6 md:right-6">
          <FindNearMeButton basePath="/explore" variant="map" />
        </div>
      </div>

      <div className="relative z-20 -mt-8 flex flex-col gap-7 rounded-t-[32px] bg-surface px-5 pb-28 pt-3 shadow-sheet md:mt-8 md:shadow-none md:rounded-none md:px-0 md:pb-10 md:pt-0">
        <span aria-hidden="true" className="mx-auto h-1.5 w-12 rounded-full bg-line md:hidden" />

        {focusPlace && (
          <section className="mz-pop flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-[1.9rem] font-extrabold leading-tight tracking-[-0.03em]">
                  {focusPlace.name}
                </h1>
                <p className="text-ink-soft">{placeWhere(focusPlace)}</p>
              </div>
              <SeeAllLink href="/explore">All places</SeeAllLink>
            </div>

            {inFocus.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-2.5 lg:max-w-xl">
                  <FocusStat label="Circles" value={String(inFocus.length)} className="bg-night text-on-night" />
                  <FocusStat label="Raised" value={formatZAR(focusRaised, { compact: true })} className="bg-lime text-on-lime" />
                  <FocusStat label="Supporters" value={String(focusSupporters)} className="bg-surface text-ink" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {inFocus.map((c) => (
                    <CircleCard key={c.id} circle={c} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-start gap-3 rounded-card bg-surface p-5 shadow-card lg:max-w-xl">
                  <p className="text-[1.2rem] font-bold text-ink">
                    No circles in {focusPlace.name} yet
                  </p>
                  <p className="text-ink-soft">
                    Know a family, school or project here that needs support? Start the first
                    circle and share it with the people around you.
                  </p>
                  <ButtonLink href="/create" className="mt-1">
                    Start a circle
                  </ButtonLink>
                </div>
                {nearestToFocus.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <h2 className="text-[1.3rem] font-bold">Nearest circles</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {nearestToFocus.map((c) => (
                        <CircleCard key={c.id} circle={c} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {near && !focusPlace && (
          <section className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-[1.6rem] font-extrabold">Circles near you</h1>
                <p className="text-ink-soft">
                  {closest.length} {closest.length === 1 ? "circle" : "circles"} · closest first
                </p>
              </div>
              <SeeAllLink href={`/?${nearParams}`} />
            </div>
            <div className="rail -mx-5 gap-4 px-5 md:mx-0 md:grid md:grid-cols-2 md:px-0 lg:grid-cols-3">
              {closest.map((c) => (
                <div key={c.id} className="w-[80%] shrink-0 md:w-auto">
                  <CircleCard circle={c} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={`flex-col gap-4 ${focusPlace ? "hidden" : "flex"}`}>
          <div>
            {near ? (
              <h2 className="text-[1.4rem] font-bold">Places with circles</h2>
            ) : (
              <h1 className="text-[1.6rem] font-extrabold">Causes by place</h1>
            )}
            <p className="text-ink-soft">
              {visible.length} {visible.length === 1 ? "place" : "places"} ·{" "}
              {province ?? "across South Africa"}. Support your own, or back another.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {visible.map((area) => (
              <li key={area.id}>
                <Link
                  href={`/explore?place=${area.id}`}
                  className="flex items-center gap-4 rounded-3xl bg-surface shadow-card px-5 py-4 transition-transform active:scale-[0.99]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[1.1rem] font-bold leading-tight text-ink">
                      {area.name}
                    </p>
                    <p className="mt-0.5 truncate text-[0.85rem] text-ink-soft">
                      {area.name === area.mainPlaceName ? "" : `${area.mainPlaceName} · `}
                      {area.municipality} · {area.province}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-ink tnum">
                      {formatZAR(area.raisedCents, { compact: true })}
                    </p>
                    <p className="text-[0.75rem] text-ink-soft tnum">
                      {area.circleCount} {area.circleCount === 1 ? "circle" : "circles"}
                    </p>
                  </div>
                  <ChevronRightIcon className="size-5 shrink-0 text-ink-soft" />
                </Link>
              </li>
            ))}
            {visible.length === 0 && (
              <li className="rounded-3xl border-2 border-dashed border-line px-4 py-8 text-center text-sm text-ink-soft md:col-span-2">
                No circles in this province yet — search a place above, or start one.
              </li>
            )}
          </ul>
        </section>

        {/* An empty chosen place already offers this in its own card. */}
        {!(focusPlace && inFocus.length === 0) && (
          <div className="flex flex-col items-start gap-3 rounded-card bg-lime p-6 text-on-lime shadow-lime">
            <p className="text-[1.25rem] font-bold leading-tight">Don&apos;t see your area?</p>
            <p className="opacity-80">
              Start the first circle for a family, a school or a street near you. Once
              it&apos;s created, it shows up on this map for everyone nearby to find.
            </p>
            <Link
              href="/create"
              className="mt-1 flex items-center gap-2 rounded-full bg-shade px-5 py-3.5 font-bold text-white shadow-pill"
            >
              <PlusIcon className="size-5" />
              Start a circle
            </Link>
          </div>
        )}
        <p className="text-center text-[0.7rem] text-ink-faint">{PLACE_DATA_CREDIT}</p>
      </div>
    </div>
  );
}

function FocusStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className={`flex flex-col gap-1 rounded-3xl p-4 shadow-card ${className}`}>
      <span className="text-[1.35rem] font-extrabold leading-tight tracking-tight tnum">{value}</span>
      <span className="text-[0.72rem] font-semibold uppercase tracking-wide opacity-70">{label}</span>
    </div>
  );
}

function parseNear(
  lat?: string,
  lng?: string,
): { lat: number; lng: number } | undefined {
  if (!lat || !lng) return undefined;
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return undefined;
  if (Math.abs(latNum) > 90 || Math.abs(lngNum) > 180) return undefined;
  return { lat: latNum, lng: lngNum };
}
