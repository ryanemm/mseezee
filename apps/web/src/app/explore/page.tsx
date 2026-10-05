import type { Metadata } from "next";
import Link from "next/link";
import { PLACE_DATA_CREDIT, formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { summarisePlaces } from "@/lib/places";
import { ExplorePlaceSearch } from "@/components/place/ExplorePlaceSearch";

export const metadata: Metadata = {
  title: "Explore places",
  description: "Search community causes by suburb, township or town across South Africa.",
};

type Search = { province?: string };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  // Only places that actually have circles are listed; anything else is
  // reachable through search, where its page says it has none yet.
  const areas = summarisePlaces(await api.listCircles({}));

  const provinces = [...new Set(areas.map((a) => a.province))].sort();
  const province = provinces.includes(sp.province ?? "") ? sp.province : undefined;
  const visible = province ? areas.filter((a) => a.province === province) : areas;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <p className="eyebrow text-[0.78rem] tracking-[0.16em]">Explore</p>
        <h1 className="font-sans text-[1.95rem] font-extrabold leading-[1.1] tracking-tight text-forest lg:text-[2.7rem]">
          Causes by place
        </h1>
        <p className="text-[0.95rem] leading-relaxed text-ink-soft lg:max-w-md">
          Search any suburb, township or town to see what&apos;s happening there.
          Support your own, or back another.
        </p>
      </header>

      <div className="lg:max-w-xl">
        <ExplorePlaceSearch />
      </div>

      <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 pt-0.5 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
        <ProvincePill href="/explore" active={!province} label="All" />
        {provinces.map((p) => (
          <ProvincePill
            key={p}
            href={`/explore?province=${encodeURIComponent(p)}`}
            active={province === p}
            label={p}
          />
        ))}
      </div>

      <ul className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {visible.map((area) => (
          <li key={area.id}>
            <Link
              href={`/places/${area.id}`}
              className="flex flex-col gap-3 rounded-[24px] border border-line bg-surface px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between transition-[border-color,transform] hover:border-gold-line/60 active:scale-[0.99]"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-display text-[1.35rem] font-bold leading-tight text-ink">
                  {area.name}
                </p>
                <p className="mt-1 text-[0.82rem] text-ink-soft">
                  {area.name === area.mainPlaceName ? "" : `${area.mainPlaceName} · `}
                  {area.municipality} · {area.province}
                </p>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line/70 pt-3 sm:justify-end sm:border-t-0 sm:pt-0">
                <div className="sm:text-right">
                  <p className="text-base font-bold text-forest tnum">
                    {formatZAR(area.raisedCents, { compact: true })} raised
                  </p>
                  <p className="text-[0.72rem] text-ink-faint tnum">
                    {area.circleCount} {area.circleCount === 1 ? "circle" : "circles"}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="flex size-8 items-center justify-center rounded-full border border-gold-line/55 bg-surface text-gold-line shadow-pill"
                >
                  →
                </span>
              </div>
            </Link>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="rounded-[24px] border border-dashed border-line bg-surface px-4 py-8 text-center text-sm text-ink-faint md:col-span-2">
            No circles in this province yet — search a place above, or start one.
          </li>
        )}
      </ul>

      <div className="rounded-[24px] border border-dashed border-gold-line/70 bg-gold-soft/40 p-5 text-[0.85rem] leading-relaxed text-ink-soft">
        <p className="font-display text-base font-bold text-ink">
          Twinning · coming soon
        </p>
        <p className="mt-1">
          Pair a wealthier suburb with a township so support flows where it is
          needed most. If your workplace or church wants to twin with an area,
          get in touch.
        </p>
      </div>
      <p className="pb-2 text-center text-[0.7rem] text-ink-faint">{PLACE_DATA_CREDIT}</p>
    </div>
  );
}

function ProvincePill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full border px-4 py-2 text-[0.88rem] font-semibold transition-[background-color,box-shadow,color] ${
        active
          ? "border-forest bg-[linear-gradient(180deg,var(--forest-bright),var(--forest))] text-surface shadow-[0_6px_14px_-5px_rgba(31,74,52,0.55),inset_0_1px_0_rgba(255,255,255,0.2)]"
          : "border-gold-line/45 bg-surface text-ink shadow-pill hover:border-gold-line"
      }`}
    >
      {label}
    </Link>
  );
}
