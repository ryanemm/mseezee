import type { Metadata } from "next";
import Link from "next/link";
import { formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { resolveAreaSlug } from "@/lib/area";

export const metadata: Metadata = {
  title: "Explore areas",
  description: "Browse community causes by area across South Africa.",
};

export default async function ExplorePage() {
  const [areas, homeSlug] = await Promise.all([
    api.listAreas(),
    resolveAreaSlug(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 lg:px-8">
      <header className="flex flex-col gap-1">
        <p className="eyebrow">Explore</p>
        <h1 className="text-2xl lg:text-3xl">Causes by area</h1>
        <p className="text-sm text-ink-soft lg:max-w-md">
          Every neighbourhood on MseeZee has its own page. Support your own, or
          back another.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {areas.map((area) => (
          <li key={area.id}>
            <Link
              href={`/areas/${area.slug}`}
              className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface p-4 shadow-card"
            >
              <div>
                <p className="flex items-center gap-2 font-display text-lg text-ink">
                  {area.name}
                  {area.slug === homeSlug && (
                    <span className="rounded-full bg-forest/10 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-forest">
                      Your area
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink-faint">
                  {area.municipality} · {area.province}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-forest tnum">
                  {formatZAR(area.raisedThisMonthCents, { compact: true })}
                </p>
                <p className="text-[0.7rem] text-ink-faint tnum">
                  {area.activeCircleCount} circles · this month
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="rounded-card border border-dashed border-gold-line bg-gold-soft/40 p-4 text-[0.82rem] text-ink-soft">
        <p className="font-semibold text-ink">Twinning · coming soon</p>
        <p className="mt-1">
          Pair a wealthier suburb with a township so support flows where it is
          needed most. If your workplace or church wants to twin with an area,
          get in touch.
        </p>
      </div>
    </div>
  );
}
