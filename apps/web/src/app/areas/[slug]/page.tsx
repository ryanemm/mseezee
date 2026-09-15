import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { CircleCard } from "@/components/circle/CircleCard";
import { ProgressBar } from "@/components/ui/ProgressBar";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = await api.getArea(slug);
  if (!area) return { title: "Area not found" };
  return {
    title: `${area.name}`,
    description: `Community causes in ${area.name}, ${area.municipality}. ${formatZAR(
      area.raisedThisMonthCents,
      { compact: true },
    )} raised this month.`,
  };
}

export default async function AreaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const area = await api.getArea(slug);
  if (!area) notFound();

  const [circles, top] = await Promise.all([
    api.listCircles({ areaSlug: slug, sort: "most_supported" }),
    api.topCircles(slug, 3),
  ]);
  const areaCircles = circles.filter((c) => c.area.slug === slug);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 lg:px-8">
      <header className="flex flex-col gap-2">
        <Link href="/explore" className="text-sm font-semibold text-forest">
          ← All areas
        </Link>
        <h1 className="text-2xl lg:text-3xl">{area.name}</h1>
        <p className="text-sm text-ink-soft">
          {area.municipality} · {area.province}
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2 rounded-card border border-line bg-surface p-4 text-center shadow-card lg:max-w-md">
        <Stat
          label="Raised this month"
          value={formatZAR(area.raisedThisMonthCents, { compact: true })}
        />
        <Stat label="Active circles" value={String(area.activeCircleCount)} />
        <Stat label="Contributors" value={String(area.contributorCount)} />
      </div>

      {top.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <p className="eyebrow">Most supported right now</p>
          <ol className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface shadow-card lg:max-w-2xl">
            {top.map((c, i) => (
              <li key={c.id}>
                <Link
                  href={`/circles/${c.slug}`}
                  className="flex items-center gap-3 p-3.5"
                >
                  <span className="font-display text-lg font-semibold text-ink-faint tnum">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {c.title}
                    </p>
                    <div className="mt-1">
                      <ProgressBar
                        raisedCents={c.raisedCents}
                        goalCents={c.goalCents}
                        compact
                      />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <p className="eyebrow">All circles in {area.name}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {areaCircles.map((c) => (
            <CircleCard key={c.id} circle={c} />
          ))}
        </div>
        {areaCircles.length === 0 && (
          <p className="rounded-card border border-dashed border-line bg-surface px-4 py-8 text-center text-sm text-ink-faint">
            No active circles here yet.
          </p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-display text-lg text-forest tnum">{value}</span>
      <span className="text-[0.62rem] font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </span>
    </div>
  );
}
