import Link from "next/link";
import { redirect } from "next/navigation";
import type { Circle } from "@mseezee/shared";
import {
  LEGACY_AREA_PLACES,
  PLACE_DATA_CREDIT,
  distanceKm,
  formatZAR,
} from "@mseezee/shared";
import { auth } from "@/auth";
import { api } from "@/lib/api";
import { circlesIn, getPlace, summarisePlaces } from "@/lib/places";
import { AreaMap } from "@/components/layout/AreaMap";
import { initials } from "@/lib/format";
import { CircleCard, FeaturedCircleCard } from "@/components/circle/CircleCard";
import { FindNearMeButton } from "@/components/circle/FindNearMeButton";
import { ExplorePlaceSearch, HOME_MAP_ID } from "@/components/place/ExplorePlaceSearch";
import { AreaPreview } from "@/components/home/AreaPreview";
import { SeeAllLink } from "@/components/ui/Button";
import { AlmostThere } from "@/components/home/AlmostThere";
import { HowItWorks } from "@/components/home/HowItWorks";
import { HomeAppBar } from "@/components/home/HomeAppBar";

type Search = {
  area?: string;
  lat?: string;
  lng?: string;
  /** A place chosen from search or a map pin — the map focuses on it. */
  place?: string;
  /** A circle chosen from search — listed first in the place's preview. */
  circle?: string;
};

/** How many circles get the big card treatment before the compact grid. */
const FEATURED = 5;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;

  // Links from before places existed (`/?area=soweto`) still land somewhere sensible.
  const legacy = sp.area ? LEGACY_AREA_PLACES[sp.area] : undefined;
  if (legacy) redirect(`/places/${legacy.id}`);

  const near = parseNear(sp.lat, sp.lng);

  const [all, session, focusPlace] = await Promise.all([
    api.listCircles({ sort: "most_supported" }),
    auth(),
    sp.place ? getPlace(sp.place) : null,
  ]);
  const everything: Circle[] = near
    ? all
        .map((c) => ({ ...c, distanceKm: distanceKm(near, c.area) }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
    : all;

  const featured = everything.slice(0, FEATURED);
  const places = summarisePlaces(all);
  // The big lime pin: the closest place once located, else the one that has
  // raised the most. A chosen place gets its own labelled tag instead.
  const highlightId = focusPlace
    ? undefined
    : near
      ? everything[0]?.area.id
      : [...places].sort((a, b) => b.raisedCents - a.raisedCents)[0]?.id;

  // The chosen place's circles, a searched-for circle first.
  const inFocus = focusPlace
    ? circlesIn(all, focusPlace.id).sort(
        (a, b) => Number(b.slug === sp.circle) - Number(a.slug === sp.circle),
      )
    : [];
  const focusRaised = inFocus.reduce((sum, c) => sum + c.raisedCents, 0);
  const focus = focusPlace
    ? {
        id: focusPlace.id,
        lat: focusPlace.lat,
        lng: focusPlace.lng,
        name: focusPlace.name,
        raisedCents: inFocus.length > 0 ? focusRaised : null,
      }
    : null;
  const more = everything.slice(FEATURED);

  const baseParams: Record<string, string> = near
    ? { lat: String(near.lat), lng: String(near.lng) }
    : {};
  // Clearing the chosen place keeps everything else about the view.
  const clearHref = `/?${new URLSearchParams(baseParams).toString()}`;

  const user = session?.user;
  const name = user?.name || user?.email || user?.phone || "";
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 md:pt-8 lg:px-10 lg:pt-10">
      <HomeAppBar avatar={user ? initials(name) : null} />

      <header className="-mt-1 flex items-start justify-between gap-4 md:mt-0">
        <div className="min-w-0">
          <p className="truncate text-[1.6rem] font-extrabold leading-tight tracking-tight">
            Sawubona{firstName ? `, ${firstName}` : ""}
          </p>
          <p className="text-[1.02rem] text-ink-soft">Close to home. Close to heart.</p>
        </div>
        {/* Phones and tablets have this in the app bar. */}
        {user && (
          <Link
            href="/profile"
            aria-label="Your profile"
            className="hidden size-14 shrink-0 items-center justify-center rounded-full bg-forest text-lg font-bold text-white md:flex"
          >
            {initials(name)}
          </Link>
        )}
      </header>

      <h1 className="max-w-xl text-[2.55rem] font-extrabold leading-[1.04] tracking-[-0.04em] lg:text-[3.4rem]">
        Who are we supporting today?
      </h1>

      <section className="flex flex-col gap-4 pb-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[1.4rem] font-bold">
              {near ? "Closest to you" : "Popular right now"}
            </h2>
            {near && (
              <Link href="/" className="text-sm font-semibold text-ink-soft underline underline-offset-4">
                Show popular instead
              </Link>
            )}
          </div>
          {more.length > 0 && (
            <SeeAllLink href="#more" />
          )}
        </div>

        {everything.length === 0 ? (
          <p className="rounded-card bg-surface shadow-card px-5 py-10 text-center text-ink-soft">
            No circles right now.{" "}
            <Link href="/explore" className="link">
              Search by place
            </Link>
          </p>
        ) : (
          <div className="rail -mx-5 gap-4 px-5 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] sm:px-0">
            {featured.map((circle) => (
              <div key={circle.id} className="w-[78%] max-w-[20rem] shrink-0 sm:w-auto sm:max-w-none">
                <FeaturedCircleCard circle={circle} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section id={HOME_MAP_ID} className="flex scroll-mt-4 flex-col gap-4">
        <ExplorePlaceSearch mode="home" trailing={<FindNearMeButton />} />
        <div className="relative h-80 overflow-hidden rounded-card border border-ink/10 shadow-card lg:h-[26rem]">
          <AreaMap
            places={places}
            near={near}
            highlightId={highlightId}
            focus={focus}
            padding={{ topLeft: [12, 36], bottomRight: [12, 8] }}
            embedded
            className="absolute inset-0"
          />
          {/* Top right sits over Zimbabwe and Mozambique in the South Africa
              view — clear of every pin. */}
          <div className="absolute right-3 top-3 z-20">
            <FindNearMeButton variant="map" label errorBelow />
          </div>
        </div>
        {focusPlace && <AreaPreview place={focusPlace} circles={inFocus} clearHref={clearHref} />}
        <p className="text-[0.7rem] text-ink-faint">{PLACE_DATA_CREDIT}</p>
      </section>

      {!user && <HowItWorks />}

      <AlmostThere circles={everything} />

      {more.length > 0 && (
        <section id="more" className="flex scroll-mt-6 flex-col gap-4 pb-4">
          <h2 className="text-[1.4rem] font-bold">More circles</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {more.map((circle) => (
              <CircleCard key={circle.id} circle={circle} />
            ))}
          </div>
        </section>
      )}

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
