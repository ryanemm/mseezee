import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { distanceKm, formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { circlesIn, getPlace } from "@/lib/places";
import { ButtonLink } from "@/components/ui/Button";
import { CircleCard } from "@/components/circle/CircleCard";
import { BackLink } from "@/components/ui/IconButton";
import { PinIcon } from "@/components/ui/Icons";

type Params = { id: string };

function where(place: { name: string; mainPlaceName: string; municipality: string; province: string }) {
  return [place.name === place.mainPlaceName ? null : place.mainPlaceName, place.municipality, place.province]
    .filter(Boolean)
    .join(" · ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const place = await getPlace(id);
  if (!place) return { title: "Place not found" };
  return {
    title: place.name,
    description: `Community causes in ${place.name}, ${place.municipality}.`,
  };
}

export default async function PlacePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const place = await getPlace(id);
  if (!place) notFound();

  const all = await api.listCircles({ sort: "most_supported" });
  const here = circlesIn(all, place.id);
  const raised = here.reduce((sum, c) => sum + c.raisedCents, 0);
  const supporters = here.reduce((sum, c) => sum + c.supporterCount, 0);

  // When there's nothing here, the closest circles elsewhere are the most
  // useful thing to show.
  const nearest = here.length
    ? []
    : all
        .map((c) => ({ ...c, distanceKm: distanceKm(place, c.area) }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 4);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] lg:px-8 lg:pt-10">
      <header className="flex flex-col gap-5">
        <BackLink href="/explore" label="Search places" />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[2.4rem] font-extrabold leading-[1.04] tracking-[-0.04em] lg:text-[3rem]">
            {place.name}
          </h1>
          <p className="flex items-center gap-1.5 text-ink-soft">
            <PinIcon className="size-[18px] shrink-0" />
            {where(place)}
          </p>
        </div>
      </header>

      {here.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-2.5 lg:max-w-xl">
            <Stat label="Circles" value={String(here.length)} className="bg-night text-on-night" />
            <Stat label="Raised" value={formatZAR(raised, { compact: true })} className="bg-lime text-on-lime" />
            <Stat label="Supporters" value={String(supporters)} className="bg-surface text-ink" />
          </div>

          <section className="flex flex-col gap-4">
            <h2 className="text-[1.4rem] font-bold">Circles in {place.name}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {here.map((c) => (
                <CircleCard key={c.id} circle={c} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="flex flex-col items-start gap-3 rounded-card bg-surface p-6 shadow-card lg:max-w-xl">
            <p className="text-[1.3rem] font-bold text-ink">
              No circles in {place.name} yet
            </p>
            <p className="text-ink-soft">
              Know a family, school or project here that needs support? Start the first
              circle and share it with the people around you.
            </p>
            <ButtonLink href="/create" className="mt-2">
              Start a circle
            </ButtonLink>
          </div>

          {nearest.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-[1.4rem] font-bold">Nearest circles</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {nearest.map((c) => (
                  <CircleCard key={c.id} circle={c} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className={`flex flex-col gap-1 rounded-3xl p-4 shadow-card ${className}`}>
      <span className="text-[1.35rem] font-extrabold leading-tight tracking-tight tnum">{value}</span>
      <span className="text-[0.72rem] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </span>
    </div>
  );
}
