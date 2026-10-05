import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { distanceKm, formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { circlesIn, getPlace } from "@/lib/places";
import { ButtonLink } from "@/components/ui/Button";
import { CircleCard } from "@/components/circle/CircleCard";

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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 lg:px-8">
      <header className="flex flex-col gap-2">
        <Link href="/explore" className="text-sm font-semibold text-forest">
          ← Search places
        </Link>
        <h1 className="font-sans text-[1.95rem] font-extrabold leading-[1.1] tracking-tight text-forest lg:text-[2.4rem]">
          {place.name}
        </h1>
        <p className="text-sm text-ink-soft">{where(place)}</p>
      </header>

      {here.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-2 rounded-card border border-line bg-surface p-4 text-center shadow-card lg:max-w-md">
            <Stat label="Circles" value={String(here.length)} />
            <Stat label="Raised" value={formatZAR(raised, { compact: true })} />
            <Stat label="Supporters" value={String(supporters)} />
          </div>

          <section className="flex flex-col gap-3">
            <p className="eyebrow">Circles in {place.name}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {here.map((c) => (
                <CircleCard key={c.id} circle={c} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="flex flex-col items-start gap-3 rounded-card border border-dashed border-line bg-surface p-5 lg:max-w-xl">
            <p className="font-display text-lg font-bold text-ink">
              No circles in {place.name} yet
            </p>
            <p className="text-sm text-ink-soft">
              Know a family, school or project here that needs support? Start the first
              circle and share it with the people around you.
            </p>
            <ButtonLink href="/create">Start a circle</ButtonLink>
          </div>

          {nearest.length > 0 && (
            <section className="flex flex-col gap-3">
              <p className="eyebrow">Nearest circles</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
