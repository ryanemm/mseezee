import Link from "next/link";
import type { CircleType } from "@mseezee/shared";
import { formatZAR, isCircleType } from "@mseezee/shared";
import { api } from "@/lib/api";
import { resolveAreaSlug } from "@/lib/area";
import { AreaMap } from "@/components/layout/AreaMap";
import { CircleCard } from "@/components/circle/CircleCard";
import { FilterTabs } from "@/components/circle/FilterTabs";

type Search = { area?: string; type?: string };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const areaSlug = await resolveAreaSlug(sp.area);
  const type = normaliseType(sp.type);

  const [area, areas, circles] = await Promise.all([
    api.getArea(areaSlug),
    api.listAreas(),
    api.listCircles({ areaSlug, type, sort: "nearest" }),
  ]);

  const featured = circles.find(
    (c) => c.type === "funeral" && c.verificationTier === "evidence_verified",
  );
  const rest = circles.filter((c) => c.id !== featured?.id);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pt-5 lg:px-8">
      <header className="flex flex-col gap-1">
        <p className="eyebrow">Sawubona</p>
        <h1 className="text-2xl lg:text-3xl">Who are we supporting today?</h1>
      </header>

      <AreaMap areas={areas} current={areaSlug} />

      {area && (
        <Link
          href={`/areas/${area.slug}`}
          className="flex items-center justify-between rounded-card border border-line bg-surface px-4 py-3 shadow-card lg:max-w-md"
        >
          <div>
            <p className="font-display text-lg text-ink">{area.name}</p>
            <p className="text-xs text-ink-faint">
              <span className="font-semibold text-ink-soft tnum">
                {area.activeCircleCount}
              </span>{" "}
              active circles ·{" "}
              <span className="font-semibold text-ink-soft tnum">
                {formatZAR(area.raisedThisMonthCents, { compact: true })}
              </span>{" "}
              this month
            </p>
          </div>
          <span className="shrink-0 text-xs font-semibold text-forest">
            See area →
          </span>
        </Link>
      )}

      <FilterTabs active={type ?? "all"} areaSlug={areaSlug} />

      {featured && (
        <section className="flex flex-col gap-2">
          <p className="eyebrow">Needs support now</p>
          <div className="lg:max-w-md">
            <CircleCard circle={featured} />
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3 pb-4">
        {rest.length > 0 && <p className="eyebrow">Other circles near you</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rest.map((circle) => (
            <CircleCard key={circle.id} circle={circle} />
          ))}
          {circles.length === 0 && (
            <p className="rounded-card border border-dashed border-line bg-surface px-4 py-8 text-center text-sm text-ink-faint sm:col-span-2 xl:col-span-3">
              No {type} circles in {area?.name} right now.{" "}
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
