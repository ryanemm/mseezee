import Link from "next/link";
import type { CircleType } from "@mseezee/shared";
import { formatZAR, isCircleType } from "@mseezee/shared";
import { api } from "@/lib/api";
import { resolveAreaSlug } from "@/lib/area";
import { AreaMap } from "@/components/layout/AreaMap";
import { CircleCard } from "@/components/circle/CircleCard";
import { FilterTabs } from "@/components/circle/FilterTabs";
import { ProgressBar } from "@/components/ui/ProgressBar";

type Search = { area?: string; type?: string };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const areaSlug = await resolveAreaSlug(sp.area);
  const type = normaliseType(sp.type);

  const [area, areas, everything] = await Promise.all([
    api.getArea(areaSlug),
    api.listAreas(),
    api.listCircles({ areaSlug, sort: "nearest" }),
  ]);

  // The type filter narrows the feed, but the area's headline progress should
  // always describe the whole area — so filter here rather than in the query.
  const circles =
    type === "all" ? everything : everything.filter((c) => c.type === type);
  const inArea = everything.filter((c) => c.area.slug === areaSlug);
  const areaRaised = inArea.reduce((sum, c) => sum + c.raisedCents, 0);
  const areaGoal = inArea.reduce((sum, c) => sum + c.goalCents, 0);

  const featured = circles.find(
    (c) => c.type === "funeral" && c.verificationTier === "evidence_verified",
  );
  const rest = circles.filter((c) => c.id !== featured?.id);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <p className="eyebrow text-[0.78rem] tracking-[0.16em]">Sawubona</p>
        <h1 className="font-sans text-[1.95rem] font-extrabold leading-[1.1] tracking-tight text-forest lg:text-[2.7rem]">
          Who are we supporting today?
        </h1>
      </header>

      <AreaMap areas={areas} current={areaSlug} />

      <FilterTabs active={type} areaSlug={areaSlug} />

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
          <p className="eyebrow text-[0.78rem] tracking-[0.16em]">Other circles near you</p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rest.map((circle) => (
            <CircleCard key={circle.id} circle={circle} />
          ))}
          {circles.length === 0 && (
            <p className="rounded-card border border-dashed border-line bg-surface px-4 py-8 text-center text-sm text-ink-faint sm:col-span-2 xl:col-span-3">
              No {type === "all" ? "" : `${type} `}circles in {area?.name} right now.{" "}
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
