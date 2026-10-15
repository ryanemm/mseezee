import type { Metadata } from "next";
import Link from "next/link";
import { PLACE_DATA_CREDIT, distanceKm, formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { summarisePlaces } from "@/lib/places";
import { AreaMap } from "@/components/layout/AreaMap";
import { CircleCard } from "@/components/circle/CircleCard";
import { FindNearMeButton } from "@/components/circle/FindNearMeButton";
import { Pill } from "@/components/circle/FilterTabs";
import { ExplorePlaceSearch } from "@/components/place/ExplorePlaceSearch";
import { BackLink } from "@/components/ui/IconButton";
import { ChevronRightIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Explore places",
  description: "Search community causes by suburb, township or town across South Africa.",
};

type Search = { province?: string; lat?: string; lng?: string };

/** How many of the closest circles the sheet shows in "near me" mode. */
const NEAR_COUNT = 8;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const near = parseNear(sp.lat, sp.lng);
  const all = await api.listCircles({ sort: "most_supported" });
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

  // The big lime pin: the closest place in "near me" mode, otherwise the one
  // that has raised the most.
  const highlightId = near
    ? closest[0]?.area.id
    : [...visible].sort((a, b) => b.raisedCents - a.raisedCents)[0]?.id;

  const nearParams = near ? `lat=${near.lat}&lng=${near.lng}` : "";

  return (
    // The sheet runs under the bottom nav's clearance (the negative margin
    // matches BottomNav's spacer) so the page ends in the sheet, not a gap.
    <div className="-mb-[calc(4.5rem+env(safe-area-inset-bottom))] flex flex-col md:mx-auto md:mb-0 md:w-full md:max-w-6xl md:px-10 md:pt-8">
      <div className="relative h-[62dvh] min-h-[26rem] md:h-[30rem] md:overflow-hidden md:rounded-[32px]">
        <AreaMap places={visible} near={near} highlightId={highlightId} className="absolute inset-0" />

        <div className="absolute inset-x-0 top-0 z-30 flex flex-col gap-3 px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] md:px-6 md:pt-6">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <BackLink href="/" shape="round" />
            </div>
            <div className="min-w-0 flex-1 md:max-w-lg">
              <ExplorePlaceSearch floating />
            </div>
          </div>
          <div className="rail -mx-5 gap-2.5 px-5 md:mx-0 md:px-0">
            <Pill href={near ? `/explore?${nearParams}` : "/explore"} active={!province} floating>
              All provinces
            </Pill>
            {provinces.map((p) => (
              <Pill
                key={p}
                href={`/explore?province=${encodeURIComponent(p)}${near ? `&${nearParams}` : ""}`}
                active={province === p}
                floating
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

      <div className="relative z-20 -mt-8 flex flex-col gap-7 rounded-t-[32px] bg-surface px-5 pb-28 pt-3 md:mt-8 md:rounded-none md:px-0 md:pb-10 md:pt-0">
        <span aria-hidden="true" className="mx-auto h-1.5 w-12 rounded-full bg-line md:hidden" />

        {near && (
          <section className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-[1.6rem] font-extrabold">Circles near you</h1>
                <p className="text-ink-soft">
                  {closest.length} {closest.length === 1 ? "circle" : "circles"} · closest first
                </p>
              </div>
              <Link href={`/?${nearParams}`} className="link shrink-0">
                See all
              </Link>
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

        <section className="flex flex-col gap-4">
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
                  href={`/places/${area.id}`}
                  className="flex items-center gap-4 rounded-3xl bg-surface-sunk px-5 py-4 transition-transform active:scale-[0.99]"
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
              <li className="rounded-3xl bg-surface-sunk px-4 py-8 text-center text-sm text-ink-soft md:col-span-2">
                No circles in this province yet — search a place above, or start one.
              </li>
            )}
          </ul>
        </section>

        <div className="rounded-3xl bg-lime p-5 text-[0.9rem] leading-relaxed text-on-lime">
          <p className="text-[1.05rem] font-bold">Twinning · coming soon</p>
          <p className="mt-1 opacity-80">
            Pair a wealthier suburb with a township so support flows where it is
            needed most. If your workplace or church wants to twin with an area,
            get in touch.
          </p>
        </div>
        <p className="text-center text-[0.7rem] text-ink-faint">{PLACE_DATA_CREDIT}</p>
      </div>
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
