import Link from "next/link";
import { redirect } from "next/navigation";
import type { Circle, CircleType } from "@mseezee/shared";
import { LEGACY_AREA_PLACES, distanceKm, isCircleType } from "@mseezee/shared";
import { auth } from "@/auth";
import { api } from "@/lib/api";
import { initials } from "@/lib/format";
import { CircleCard, FeaturedCircleCard } from "@/components/circle/CircleCard";
import { FilterTabs } from "@/components/circle/FilterTabs";
import { FindNearMeButton } from "@/components/circle/FindNearMeButton";
import { ExplorePlaceSearch } from "@/components/place/ExplorePlaceSearch";
import { SeeAllLink } from "@/components/ui/Button";
import { ArrowRightIcon, MapIcon } from "@/components/ui/Icons";
import { AlmostThere } from "@/components/home/AlmostThere";
import { HowItWorks } from "@/components/home/HowItWorks";

type Search = { area?: string; type?: string; lat?: string; lng?: string };

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

  const type = normaliseType(sp.type);
  const near = parseNear(sp.lat, sp.lng);

  const [all, session] = await Promise.all([
    api.listCircles({ sort: "most_supported" }),
    auth(),
  ]);
  const everything: Circle[] = near
    ? all
        .map((c) => ({ ...c, distanceKm: distanceKm(near, c.area) }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
    : all;

  const circles =
    type === "all" ? everything : everything.filter((c) => c.type === type);
  const featured = circles.slice(0, FEATURED);
  const more = circles.slice(FEATURED);

  const baseParams: Record<string, string> = near
    ? { lat: String(near.lat), lng: String(near.lng) }
    : {};

  const user = session?.user;
  const name = user?.name || user?.email || user?.phone || "";
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pt-7 lg:px-10 lg:pt-10">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-[1.6rem] font-extrabold leading-tight tracking-tight">
            Sawubona{firstName ? `, ${firstName}` : ""}
          </p>
          <p className="text-[1.02rem] text-ink-soft">
            {user ? "Welcome back to MseeZee" : "Welcome to MseeZee"}
          </p>
        </div>
        {user ? (
          <Link
            href="/profile"
            aria-label="Your profile"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-forest text-lg font-bold text-white"
          >
            {initials(name)}
          </Link>
        ) : (
          <Link
            href="/sign-in"
            className="shrink-0 rounded-full bg-night px-5 py-3 text-[0.95rem] font-bold text-on-night md:hidden"
          >
            Sign in
          </Link>
        )}
      </header>

      <h1 className="max-w-xl text-[2.55rem] font-extrabold leading-[1.04] tracking-[-0.04em] lg:text-[3.4rem]">
        Who are we supporting today?
      </h1>

      <div className="lg:max-w-xl">
        <ExplorePlaceSearch trailing={<FindNearMeButton />} />
      </div>

      <FilterTabs active={type} baseParams={baseParams} counts={countByType(everything)} />

      <section className="flex flex-col gap-4 pb-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[1.4rem] font-bold">
              {near ? "Closest to you" : "Popular right now"}
            </h2>
            {near && (
              <Link href={type === "all" ? "/" : `/?type=${type}`} className="text-sm font-semibold text-ink-soft underline underline-offset-4">
                Show popular instead
              </Link>
            )}
          </div>
          {more.length > 0 && (
            <SeeAllLink href="#more" />
          )}
        </div>

        {circles.length === 0 ? (
          <p className="rounded-card bg-surface shadow-card px-5 py-10 text-center text-ink-soft">
            No {type === "all" ? "" : `${type} `}circles right now.{" "}
            <Link href="/explore" className="link">
              Search by place
            </Link>
          </p>
        ) : (
          <div className="rail -mx-5 gap-4 px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 xl:grid-cols-3">
            {featured.map((circle) => (
              <div key={circle.id} className="w-[86%] shrink-0 sm:w-auto">
                <FeaturedCircleCard circle={circle} />
              </div>
            ))}
          </div>
        )}
      </section>

      {!user && <HowItWorks />}

      <AlmostThere circles={circles} />

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

      <Link
        href="/explore"
        className="mb-2 flex items-center gap-4 rounded-card bg-surface p-4 shadow-card transition-transform hover:-translate-y-px active:scale-[0.99]"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-lime text-on-lime">
          <MapIcon className="size-7" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-ink">Search causes by place on the map</span>
          <span className="block text-[0.9rem] text-ink-soft">
            Every suburb, township and town in South Africa
          </span>
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-night text-on-night">
          <ArrowRightIcon className="size-5" />
        </span>
      </Link>
    </div>
  );
}

function countByType(circles: Circle[]): Record<string, number> {
  const counts: Record<string, number> = { all: circles.length };
  for (const c of circles) counts[c.type] = (counts[c.type] ?? 0) + 1;
  return counts;
}

function normaliseType(value?: string): CircleType | "all" {
  return value && isCircleType(value) ? value : "all";
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
