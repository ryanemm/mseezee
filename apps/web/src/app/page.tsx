import Link from "next/link";
import { cookies } from "next/headers";
import type { Area, Circle, CircleType } from "@mseezee/shared";
import { distanceKm, findArea, formatZAR, isCircleType } from "@mseezee/shared";
import { api } from "@/lib/api";
import { AREA_COOKIE } from "@/lib/area";
import { AreaMap } from "@/components/layout/AreaMap";
import { CircleCard } from "@/components/circle/CircleCard";
import { FilterTabs } from "@/components/circle/FilterTabs";
import { FindNearMeButton } from "@/components/circle/FindNearMeButton";
import { ProgressBar } from "@/components/ui/ProgressBar";

type Search = { area?: string; type?: string; lat?: string; lng?: string };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const type = normaliseType(sp.type);
  const near = parseNear(sp.lat, sp.lng);

  // An explicit area only applies when there's no "near me" fix in play —
  // a fresh location is a stronger, fresher signal than a remembered pick.
  const explicitAreaSlug = near ? undefined : await resolveExplicitAreaSlug(sp.area);

  const areas = await api.listAreas();

  let everything: Circle[];
  let area: Area | null = null;

  if (near) {
    const areaBySlug = new Map(areas.map((a) => [a.slug, a]));
    everything = (await api.listCircles({ sort: "most_supported" }))
      .map((c) => {
        const a = areaBySlug.get(c.area.slug);
        return a ? { ...c, distanceKm: distanceKm(near, a) } : c;
      })
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  } else if (explicitAreaSlug) {
    [area, everything] = await Promise.all([
      api.getArea(explicitAreaSlug),
      api.listCircles({ areaSlug: explicitAreaSlug, sort: "nearest" }),
    ]);
  } else {
    everything = await api.listCircles({ sort: "most_supported" });
  }

  // The type filter narrows the feed, but the area's headline progress should
  // always describe the whole area — so filter here rather than in the query.
  const circles =
    type === "all" ? everything : everything.filter((c) => c.type === type);

  let areaRaised = 0;
  let areaGoal = 0;
  if (area) {
    const inArea = everything.filter((c) => c.area.slug === area!.slug);
    areaRaised = inArea.reduce((sum, c) => sum + c.raisedCents, 0);
    areaGoal = inArea.reduce((sum, c) => sum + c.goalCents, 0);
  }

  // "Near me" is already the most relevant ranking there is — pulling one
  // circle out into its own "Needs support now" section would bury the
  // actual closest result further down the page.
  const featured = near
    ? undefined
    : circles.find(
        (c) => c.type === "funeral" && c.verificationTier === "evidence_verified",
      );
  const rest = featured ? circles.filter((c) => c.id !== featured.id) : circles;

  const baseParams: Record<string, string> = near
    ? { lat: String(near.lat), lng: String(near.lng) }
    : explicitAreaSlug
      ? { area: explicitAreaSlug }
      : {};

  const listLabel = near
    ? "Closest to you"
    : area
      ? "Other circles near you"
      : "Top circles right now";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <p className="eyebrow text-[0.78rem] tracking-[0.16em]">Sawubona</p>
        <h1 className="font-sans text-[1.95rem] font-extrabold leading-[1.1] tracking-tight text-forest lg:text-[2.7rem]">
          Who are we supporting today?
        </h1>
      </header>

      <FindNearMeButton />

      <AreaMap areas={areas} current={explicitAreaSlug} near={near} />

      <FilterTabs active={type} baseParams={baseParams} />

      {area && (
        <div className="flex items-center justify-between gap-4 rounded-[24px] border border-line bg-surface px-5 py-4 shadow-card lg:max-w-xl">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div>
              <p className="font-display text-[1.7rem] font-bold leading-none text-ink">
                {area.name}
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                <span className="font-bold text-ink tnum">
                  {area.activeCircleCount}
                </span>{" "}
                active circles ·{" "}
                <span className="font-bold text-ink tnum">
                  {formatZAR(area.raisedThisMonthCents, { compact: true })}
                </span>{" "}
                this month
              </p>
            </div>
            {areaGoal > 0 && (
              <div title={`${formatZAR(areaRaised)} of ${formatZAR(areaGoal)} across circles here`}>
                <ProgressBar raisedCents={areaRaised} goalCents={areaGoal} hideLabels />
              </div>
            )}
          </div>
          <Link
            href={`/areas/${area.slug}`}
            className="shrink-0 rounded-full border border-gold-line/55 bg-surface px-4 py-2.5 text-sm font-semibold text-ink shadow-pill transition-colors hover:bg-surface-sunk"
          >
            See area <span className="text-gold-line">→</span>
          </Link>
        </div>
      )}

      {featured && (
        <section className="flex flex-col gap-3">
          <p className="eyebrow text-[0.78rem] tracking-[0.16em]">Needs support now</p>
          <div className="lg:max-w-lg">
            <CircleCard circle={featured} featured />
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3 pb-4">
        {rest.length > 0 && (
          <p className="eyebrow text-[0.78rem] tracking-[0.16em]">{listLabel}</p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rest.map((circle) => (
            <CircleCard key={circle.id} circle={circle} />
          ))}
          {circles.length === 0 && (
            <p className="rounded-card border border-dashed border-line bg-surface px-4 py-8 text-center text-sm text-ink-faint sm:col-span-2 xl:col-span-3">
              No {type === "all" ? "" : `${type} `}circles
              {area ? ` in ${area.name}` : ""} right now.{" "}
              <Link href="/explore" className="font-semibold text-forest">
                Explore other areas
              </Link>
            </p>
          )}
        </div>
      </section>

      <Link
        href="/explore"
        className="mb-2 text-center text-sm font-semibold text-forest"
      >
        Explore causes in other areas →
      </Link>
    </div>
  );
}

function normaliseType(value?: string): CircleType | "all" {
  return value && isCircleType(value) ? value : "all";
}

/** An explicit `?area=` wins, then a previously remembered choice — unlike
 *  `resolveAreaSlug` (used elsewhere for pages that always need *some* area),
 *  this returns nothing rather than a default, so the home page can tell
 *  "never chosen" apart from "chose the default area". */
async function resolveExplicitAreaSlug(
  searchParamArea?: string,
): Promise<string | undefined> {
  if (searchParamArea && findArea(searchParamArea)) return searchParamArea;
  const store = await cookies();
  const fromCookie = store.get(AREA_COOKIE)?.value;
  return fromCookie && findArea(fromCookie) ? fromCookie : undefined;
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
