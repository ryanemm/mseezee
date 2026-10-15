import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Supporter } from "@mseezee/shared";
import { formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { CoverArt } from "@/components/ui/CoverArt";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CountUp } from "@/components/ui/CountUp";
import { DistanceChip, ExampleChip, TypeChip, VerifiedChip } from "@/components/ui/Chip";
import { BackLink, iconButtonClass } from "@/components/ui/IconButton";
import { SeeAllLink } from "@/components/ui/Button";
import { HeartIcon, ShieldIcon } from "@/components/ui/Icons";
import { AreaMiniMap } from "@/components/circle/AreaMiniMap";
import { CircleTabs } from "@/components/circle/CircleTabs";
import { ContributeBar } from "@/components/circle/ContributeBar";
import { ContributeRail } from "@/components/circle/ContributeRail";
import { ShareCircle, ShareIconButton } from "@/components/circle/ShareCircle";
import { circleShareText } from "@/lib/share";
import { contributionBlock } from "@/lib/contributions-open";
import { eventDateLabel, initials, relativeDay } from "@/lib/format";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const circle = await api.getCircle(slug);
  if (!circle) return { title: "Circle not found" };
  const description = circleShareText(circle);
  return {
    title: circle.title,
    description,
    // What WhatsApp, Facebook and X show in the preview card when a circle's
    // link is shared. The image comes from ./opengraph-image.tsx.
    openGraph: {
      title: circle.title,
      description,
      url: `/circles/${circle.slug}`,
      siteName: "MseeZee",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: circle.title, description },
    // Example circles aren't real causes — keep them out of search results.
    robots: circle.isDemo ? { index: false } : undefined,
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
  const blocked = contributionBlock(circle);
  const placeLabel = circle.areaSection
    ? `${circle.area.name} · ${circle.areaSection}`
    : circle.area.name;
  const faces = supporters.slice(0, 3);
  const moreFaces = circle.supporterCount - faces.length;

  return (
    <div className="min-h-dvh bg-surface pb-36 lg:bg-transparent lg:pb-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col lg:flex-row lg:items-start lg:gap-10 lg:px-10 lg:pt-8">
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Hero */}
          <div className="relative h-72 lg:h-80 lg:overflow-hidden lg:rounded-[32px] lg:shadow-lift">
            <CoverArt cover={circle.cover} accent="disc" className="h-full w-full" />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] lg:pt-5">
              <BackLink href="/" shape="round" />
              <div className="flex gap-3">
                {!blocked && <ShareIconButton circle={circle} />}
                <button type="button" aria-label="Save circle" className={iconButtonClass("round")}>
                  <HeartIcon className="size-[22px]" />
                </button>
              </div>
            </div>
          </div>

          {/* Sheet */}
          <div className="relative -mt-10 flex flex-col gap-6 rounded-t-[32px] bg-surface px-5 pt-3 shadow-sheet lg:mt-8 lg:shadow-none lg:rounded-none lg:px-0 lg:pt-0">
            <span aria-hidden="true" className="mx-auto h-1.5 w-12 rounded-full bg-line lg:hidden" />

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <DistanceChip areaName={placeLabel} />
                <VerifiedChip tier={circle.verificationTier} />
                <TypeChip type={circle.type} />
                {circle.isDemo && <ExampleChip />}
                {circle.status === "goal_reached" && (
                  <span className="rounded-full bg-good/10 px-3 py-1.5 text-[0.8rem] font-bold text-good">
                    Goal reached · still open
                  </span>
                )}
              </div>

              {isFuneral && !circle.title.toLowerCase().startsWith("in loving memory") && (
                <p className="-mb-2 text-[0.95rem] italic text-ink-soft">
                  In loving memory of {circle.beneficiaryName.replace(" family", "")}
                </p>
              )}
              <h1 className="text-[2.1rem] font-extrabold leading-[1.06] tracking-[-0.035em] lg:text-[2.6rem]">
                {circle.title}
              </h1>
              {isFuneral && circle.eventDate && (
                <p className="-mt-1 font-semibold text-ink">
                  Service {eventDateLabel(circle.eventDate)}
                </p>
              )}
              <p className="text-[1.05rem] leading-relaxed text-ink-soft">
                {circle.summary}{" "}
                <a href="#circle-tabs" className="link whitespace-nowrap">
                  Read more
                </a>
              </p>
            </div>

            {/* Progress — the desktop rail covers this, so it's phone/tablet only. */}
            <section className="flex flex-col gap-5 rounded-card bg-surface shadow-card p-6 lg:hidden">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[2.3rem] font-extrabold leading-none tracking-tight tnum">
                    <CountUp value={circle.raisedCents} />
                  </p>
                  <p className="mt-2 text-ink-soft">raised of {formatZAR(circle.goalCents)}</p>
                </div>
                {faces.length > 0 && (
                  <div className="flex shrink-0 -space-x-2.5" aria-hidden="true">
                    {faces.map((s, i) => (
                      <span
                        key={s.id}
                        className={`flex size-11 items-center justify-center rounded-full border-2 border-surface-sunk text-sm font-bold ${FACE_COLOURS[i]}`}
                      >
                        {initials(s.displayName)}
                      </span>
                    ))}
                    {moreFaces > 0 && (
                      <span className="flex size-11 items-center justify-center rounded-full border-2 border-surface-sunk bg-night text-sm font-bold text-on-night tnum">
                        +{moreFaces}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <ProgressBar
                raisedCents={circle.raisedCents}
                goalCents={circle.goalCents}
                hideLabels
                thick
              />
              <div className="flex items-baseline justify-between gap-4 text-[0.95rem] text-ink-soft">
                <span className="tnum">
                  {circle.supporterCount} {circle.supporterCount === 1 ? "supporter" : "supporters"}
                </span>
                <span className="text-right">Organised by {circle.organiserName}</span>
              </div>
            </section>

            <CircleTabs
              tabs={[
                {
                  key: "about",
                  label: "About",
                  content: (
                    <div className="flex flex-col gap-6">
                      <p className="whitespace-pre-line text-[1rem] leading-relaxed text-ink-soft">
                        {circle.story}
                      </p>

                      <dl className="flex flex-col gap-3 rounded-3xl bg-surface shadow-card p-5 text-[0.95rem]">
                        <div className="flex justify-between gap-4">
                          <dt className="text-ink-soft">Organised by</dt>
                          <dd className="text-right font-bold text-ink">{circle.organiserName}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-ink-soft">Funds received by</dt>
                          <dd className="text-right font-bold text-ink">
                            {circle.proxyName ?? `${circle.beneficiaryName} (verified)`}
                          </dd>
                        </div>
                        {circle.proxyName && (
                          <p className="border-t border-line pt-3 text-[0.85rem] text-ink-soft">
                            A registered community partner holds and disburses these funds,
                            and is accountable for getting them to the family.
                          </p>
                        )}
                      </dl>

                      <section className="flex flex-col gap-3">
                        <h2 className="text-[1.2rem] font-bold">Where this is</h2>
                        <AreaMiniMap
                          areaName={circle.area.name}
                          section={circle.areaSection}
                          supportersFromArea={localSupporters}
                        />
                      </section>

                      <section className="flex gap-4 rounded-3xl bg-lime p-5 text-[0.88rem] text-on-lime shadow-lime">
                        <ShieldIcon className="size-6 shrink-0" />
                        <div>
                          <p className="font-bold">How MseeZee keeps this safe</p>
                          <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 opacity-85">
                            <li>Circles are verified before they can collect above a small cap.</li>
                            <li>Contributions are final — pay only what you intend to give.</li>
                            <li>
                              Every contribution is receipted and shown here.{" "}
                              <Link href="/about/safety" className="font-bold underline underline-offset-2">
                                Learn more
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </section>
                    </div>
                  ),
                },
                {
                  key: "updates",
                  label: "Updates",
                  count: updates.length,
                  content:
                    updates.length > 0 ? (
                      <ul className="flex flex-col gap-3">
                        {updates.map((u) => (
                          <li key={u.id} className="rounded-3xl bg-surface shadow-card p-5">
                            <p className="text-[0.85rem] font-semibold text-ink-soft">
                              {relativeDay(u.createdAt)}
                            </p>
                            <p className="mt-1 text-ink">{u.body}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="rounded-3xl border border-dashed border-line px-5 py-8 text-center text-ink-soft">
                        No updates yet. The organiser posts here as the money is used.
                      </p>
                    ),
                },
                {
                  key: "supporters",
                  label: "Supporters",
                  content: (
                    <div className="flex flex-col gap-3">
                      <ul className="flex flex-col divide-y divide-line rounded-3xl bg-surface shadow-card">
                        {supporters.map((s) => (
                          <SupporterRow key={s.id} supporter={s} />
                        ))}
                        {supporters.length === 0 && (
                          <li className="px-5 py-8 text-center text-ink-soft">
                            No supporters yet — be the first.
                          </li>
                        )}
                      </ul>
                      {supporters.length > 0 && (
                        <div className="self-end">
                          <SeeAllLink href={`/circles/${circle.slug}/supporters`}>
                            See all {circle.supporterCount}
                          </SeeAllLink>
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />

            {!blocked && <ShareCircle circle={circle} />}
          </div>
        </div>

        <ContributeRail circle={circle} />
      </div>

      <ContributeBar slug={circle.slug} blocked={blocked} />
    </div>
  );
}

/** Avatar discs for the first few supporters — forest, sand, sky. */
const FACE_COLOURS = [
  "bg-forest text-white",
  "bg-[#e8d5c4] text-[#151815]",
  "bg-[#cfe0f0] text-[#151815]",
];

function SupporterRow({ supporter: s }: { supporter: Supporter }) {
  return (
    <li className="flex items-start gap-3.5 p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-sunk text-sm font-bold text-ink">
        {initials(s.displayName)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate font-bold text-ink">{s.displayName}</span>
          <span className="shrink-0 font-bold text-ink tnum">
            {s.amountCents === null ? "—" : formatZAR(s.amountCents)}
          </span>
        </div>
        <p className="text-[0.85rem] text-ink-soft">
          {relativeDay(s.createdAt)}
          {s.fromAreaName ? ` · from ${s.fromAreaName}` : ""}
        </p>
        {s.message && <p className="mt-1.5 text-[0.92rem] text-ink-soft">“{s.message}”</p>}
      </div>
    </li>
  );
}
