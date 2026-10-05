import Link from "next/link";
import { redirect } from "next/navigation";
import type { Circle, CircleType } from "@mseezee/shared";
import { LEGACY_AREA_PLACES, distanceKm, isCircleType } from "@mseezee/shared";
import { api } from "@/lib/api";
import { summarisePlaces } from "@/lib/places";
import { AreaMap } from "@/components/layout/AreaMap";
import { CircleCard } from "@/components/circle/CircleCard";
import { FilterTabs } from "@/components/circle/FilterTabs";
import { FindNearMeButton } from "@/components/circle/FindNearMeButton";

type Search = { area?: string; type?: string; lat?: string; lng?: string };

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

  const all = await api.listCircles({ sort: "most_supported" });
  const everything: Circle[] = near
    ? all
        .map((c) => ({ ...c, distanceKm: distanceKm(near, c.area) }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
    : all;

  const circles =
    type === "all" ? everything : everything.filter((c) => c.type === type);

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
    : {};

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <p className="eyebrow text-[0.78rem] tracking-[0.16em]">Sawubona</p>
        <h1 className="font-sans text-[1.95rem] font-extrabold leading-[1.1] tracking-tight text-forest lg:text-[2.7rem]">
          Who are we supporting today?
        </h1>
      </header>

      <FindNearMeButton />

      <AreaMap places={summarisePlaces(all)} near={near} />

      <FilterTabs active={type} baseParams={baseParams} />

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
          <p className="eyebrow text-[0.78rem] tracking-[0.16em]">
            {near ? "Closest to you" : "Top circles right now"}
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rest.map((circle) => (
            <CircleCard key={circle.id} circle={circle} />
          ))}
          {circles.length === 0 && (
            <p className="rounded-card border border-dashed border-line bg-surface px-4 py-8 text-center text-sm text-ink-faint sm:col-span-2 xl:col-span-3">
              No {type === "all" ? "" : `${type} `}circles right now.{" "}
              <Link href="/explore" className="font-semibold text-forest">
                Search by place
              </Link>
            </p>
          )}
        </div>
      </section>

      <Link
        href="/explore"
        className="mb-2 text-center text-sm font-semibold text-forest"
      >
        Search causes by place →
      </Link>
    </div>
  );
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
