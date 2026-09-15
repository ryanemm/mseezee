import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { CoverArt } from "@/components/ui/CoverArt";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TypeChip, VerifiedChip } from "@/components/ui/Chip";
import { AreaMiniMap } from "@/components/circle/AreaMiniMap";
import { ContributeBar } from "@/components/circle/ContributeBar";
import { ContributeRail } from "@/components/circle/ContributeRail";
import { eventDateLabel, relativeDay } from "@/lib/format";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const circle = await api.getCircle(slug);
  if (!circle) return { title: "Circle not found" };
  return {
    title: circle.title,
    description: `${circle.summary} · ${formatZAR(circle.raisedCents, {
      compact: true,
    })} raised in ${circle.area.name}.`,
  };
}

export default async function CirclePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const circle = await api.getCircle(slug);
  if (!circle) notFound();

  const [supporters, updates] = await Promise.all([
    api.listSupporters(circle.id, 4),
    api.listUpdates(circle.id),
  ]);

  const localSupporters = (await api.listSupporters(circle.id)).filter(
    (s) => s.fromAreaName === circle.area.name,
  ).length;

  const isFuneral = circle.type === "funeral";
  const closed = circle.status === "closed";

  return (
    <div className="pb-44 lg:pb-16">
      {/* Hero */}
      <div className="mx-auto w-full max-w-6xl lg:px-8">
        <div className="relative lg:overflow-hidden lg:rounded-card">
          <CoverArt
            cover={circle.cover}
            showMonogram={false}
            className={isFuneral ? "h-56 lg:h-72" : "h-44 lg:h-64"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <Link
            href="/"
            className="absolute left-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur lg:hidden"
            aria-label="Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m15 5-7 7 7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 text-white lg:p-7">
            <TypeChip type={circle.type} onDark />
            {isFuneral && (
              <p className="font-display text-sm italic text-white/85 lg:text-base">
                In loving memory of {circle.beneficiaryName.replace(" family", "")}
              </p>
            )}
            <h1 className="font-display text-2xl leading-tight text-white lg:text-4xl">
              {circle.title}
            </h1>
            <p className="text-sm text-white/80 lg:text-base">
              {circle.area.name}
              {circle.areaSection ? ` · ${circle.areaSection}` : ""} ·{" "}
              {circle.area.municipality}
            </p>
            {isFuneral && circle.eventDate && (
              <p className="text-sm font-medium text-white lg:text-base">
                Service {eventDateLabel(circle.eventDate)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-5 lg:flex-row lg:items-start lg:gap-10 lg:px-8">
        <div className="flex min-w-0 flex-1 flex-col gap-6 lg:max-w-2xl">
          {/* Progress + verification — the desktop rail covers this, so this
              block is mobile/tablet only. */}
          <section className="flex flex-col gap-3 lg:hidden">
            <ProgressBar
              raisedCents={circle.raisedCents}
              goalCents={circle.goalCents}
              supporterCount={circle.supporterCount}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <VerifiedChip tier={circle.verificationTier} />
              {circle.status === "goal_reached" && (
                <span className="rounded-full bg-good/10 px-2 py-0.5 text-[0.68rem] font-semibold text-good">
                  Goal reached · still open
                </span>
              )}
            </div>
          </section>

          {/* Organiser / proxy */}
          <section className="rounded-card border border-line bg-surface p-4 text-sm shadow-card lg:p-5">
            <dl className="flex flex-col gap-2">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">Organised by</dt>
                <dd className="text-right font-medium text-ink">
                  {circle.organiserName}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">Funds received by</dt>
                <dd className="text-right font-medium text-ink">
                  {circle.proxyName ?? `${circle.beneficiaryName} (verified)`}
                </dd>
              </div>
            </dl>
            {circle.proxyName && (
              <p className="mt-3 border-t border-line pt-3 text-[0.8rem] text-ink-soft">
                A registered community partner holds and disburses these funds,
                and is accountable for getting them to the family.
              </p>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg">About this circle</h2>
            <p className="whitespace-pre-line text-[0.95rem] text-ink-soft">
              {circle.story}
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg">Where this is</h2>
            <AreaMiniMap
              areaName={circle.area.name}
              section={circle.areaSection}
              supportersFromArea={localSupporters}
            />
          </section>

          {/* Supporters */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg">Recent supporters</h2>
              <Link
                href={`/circles/${circle.slug}/supporters`}
                className="text-sm font-semibold text-forest"
              >
                See all
              </Link>
            </div>
            <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface shadow-card">
              {supporters.map((s) => (
                <li key={s.id} className="flex items-start gap-3 p-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forest/10 font-display text-sm font-semibold text-forest">
                    {initials(s.displayName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-semibold text-ink">
                        {s.displayName}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-forest tnum">
                        {s.amountCents === null
                          ? "—"
                          : formatZAR(s.amountCents)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-faint">
                      {relativeDay(s.createdAt)}
                      {s.fromAreaName ? ` · from ${s.fromAreaName}` : ""}
                    </p>
                    {s.message && (
                      <p className="mt-1 text-[0.85rem] text-ink-soft">
                        “{s.message}”
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Updates */}
          {updates.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg">Updates</h2>
              <ul className="flex flex-col gap-3">
                {updates.map((u) => (
                  <li
                    key={u.id}
                    className="rounded-card border border-line bg-surface p-4 shadow-card"
                  >
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-ink-faint">
                      {relativeDay(u.createdAt)}
                    </p>
                    <p className="mt-1 text-[0.9rem] text-ink-soft">{u.body}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-card bg-forest/5 p-4 text-[0.82rem] text-ink-soft">
            <p className="font-semibold text-ink">How MseeZee keeps this safe</p>
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-4">
              <li>Circles are verified before they can collect above a small cap.</li>
              <li>Contributions are final — pay only what you intend to give.</li>
              <li>
                Every contribution is receipted and shown here.{" "}
                <Link href="/about/safety" className="font-semibold text-forest">
                  Learn more
                </Link>
              </li>
            </ul>
          </section>
        </div>

        <ContributeRail circle={circle} />
      </div>

      <ContributeBar slug={circle.slug} closed={closed} />
    </div>
  );
}

function initials(name: string): string {
  const clean = name.replace(/[^a-zA-Z ]/g, "").trim();
  if (!clean) return "•";
  const parts = clean.split(/\s+/);
  return (
    (parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")
  ).toUpperCase();
}
