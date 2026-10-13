import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatZAR } from "@mseezee/shared";
import { auth } from "@/auth";
import { api } from "@/lib/api";
import { prisma } from "@/lib/db";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { DisbursementList } from "@/components/dashboard/DisbursementList";
import { PayoutAccountCard } from "@/components/dashboard/PayoutAccountCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CircleEmblem } from "@/components/ui/CoverArt";
import { BackLink } from "@/components/ui/IconButton";
import { ChevronRightIcon } from "@/components/ui/Icons";
import { relativeDay } from "@/lib/format";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dash = await api.getCircleDashboard(slug);
  return { title: dash ? `Manage · ${dash.circle.title}` : "Manage circle" };
}

export default async function ManageCirclePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const [session, dbCircle] = await Promise.all([
    auth(),
    prisma.circle.findUnique({
      where: { slug },
      select: { organiserId: true, payoutBankName: true, payoutAccountName: true },
    }),
  ]);
  // Mock fixture circles have no real organiser account and stay open, as
  // before — this gate only applies to real, DB-backed circles.
  if (dbCircle) {
    if (!session?.user?.id) redirect(`/sign-in?callbackUrl=/dashboard/${slug}`);
    if (dbCircle.organiserId !== session.user.id) notFound();
  }

  const dash = await api.getCircleDashboard(slug);
  if (!dash) notFound();

  const { circle } = dash;
  const [supporters, thankYous] = await Promise.all([
    api.listSupporters(circle.id, 5),
    api.listThankYous(circle.id),
  ]);

  const menu = [
    { label: "Contributions", href: `/circles/${slug}/supporters`, badge: circle.supporterCount },
    { label: "Messages & thank-you", href: `/dashboard/${slug}#messages`, badge: dash.unthankedCount, alert: dash.unthankedCount > 0 },
    { label: "Payouts", href: `/dashboard/${slug}#payouts`, badge: dash.disbursements.length },
    { label: "Updates", href: `/circles/${slug}`, badge: dash.updateCount },
    { label: "Public page", href: `/circles/${slug}` },
    { label: "Circle settings", href: `/dashboard/${slug}` },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] lg:px-8 lg:pt-10">
      <header className="flex flex-col gap-4">
        <BackLink href="/dashboard" label="Your circles" />
        <div className="flex items-center gap-4">
          <CircleEmblem type={circle.type} className="size-16 rounded-[20px]" />
          <div className="min-w-0">
            <h1 className="text-[1.6rem] font-extrabold leading-tight tracking-tight">
              {circle.title}
            </h1>
            <p className="text-[0.88rem] text-ink-soft">
              {circle.proxyName
                ? `Funds held by ${circle.proxyName}`
                : "Funds paid to the verified beneficiary"}{" "}
              · Circle {circle.slug}
            </p>
          </div>
        </div>
      </header>

      <StatTiles
        items={[
          { label: "Received", value: formatZAR(dash.settledCents, { compact: true }), tone: "forest" },
          { label: "Clearing", value: formatZAR(dash.pendingCents, { compact: true }), tone: "gold" },
          { label: "Paid out", value: formatZAR(dash.disbursedCents, { compact: true }), tone: "ink" },
        ]}
      />

      <section className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card">
        <ProgressBar
          raisedCents={dash.settledCents}
          goalCents={circle.goalCents}
          supporterCount={circle.supporterCount}
          thick
        />
        {dash.lastContributionAt && (
          <p className="text-[0.85rem] text-ink-soft">
            Last contribution {relativeDay(dash.lastContributionAt)}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[1.4rem] font-bold">Manage</h2>
        <ul className="flex flex-col divide-y divide-line rounded-card bg-surface px-5 shadow-card">
          {menu.map((m) => (
            <li key={m.label}>
              <Link href={m.href} className="flex items-center justify-between gap-3 py-4">
                <span className="font-bold text-ink">{m.label}</span>
                <span className="flex items-center gap-2">
                  {m.badge !== undefined && m.badge > 0 && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[0.75rem] font-bold tnum ${
                        m.alert ? "bg-lime text-on-lime" : "bg-surface-sunk text-ink-soft"
                      }`}
                    >
                      {m.badge}
                    </span>
                  )}
                  <ChevronRightIcon className="size-5 text-ink-soft" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="payouts" className="flex scroll-mt-6 flex-col gap-3">
        <h2 className="text-[1.4rem] font-bold">Payouts</h2>
        {dbCircle && (
          <PayoutAccountCard
            slug={slug}
            initialBankName={dbCircle.payoutBankName}
            initialAccountName={dbCircle.payoutAccountName}
          />
        )}
        <DisbursementList disbursements={dash.disbursements} />
        <p className="text-[0.88rem] text-ink-soft">
          {circle.proxyName
            ? `${circle.proxyName} releases funds to the family and records what each payout covered.`
            : "Request a payout once you have a quote or invoice to attach."}
        </p>
      </section>

      <section id="messages" className="flex scroll-mt-6 flex-col gap-3">
        <h2 className="text-[1.4rem] font-bold">Messages &amp; thank-you</h2>
        <ul className="flex flex-col divide-y divide-line rounded-card bg-surface px-5 shadow-card">
          {thankYous.map((t) => (
            <li key={t.id} className="flex flex-col gap-1.5 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-bold text-ink">{t.supporterName}</span>
                <span className="font-bold text-ink tnum">
                  {t.amountCents === null ? "—" : formatZAR(t.amountCents)}
                </span>
              </div>
              {t.supporterMessage && (
                <p className="text-[0.92rem] text-ink-soft">“{t.supporterMessage}”</p>
              )}
              <span
                className={`mt-0.5 self-start rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide ${
                  t.thanked ? "bg-good/10 text-good" : "bg-lime text-on-lime"
                }`}
              >
                {t.thanked ? "Thanked" : "Send a thank-you"}
              </span>
            </li>
          ))}
          {thankYous.length === 0 && (
            <li className="py-6 text-center text-ink-soft">No messages yet.</li>
          )}
        </ul>
      </section>

      {supporters.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[1.4rem] font-bold">Recent contributions</h2>
          <ul className="flex flex-col divide-y divide-line rounded-card bg-surface px-5 shadow-card">
            {supporters.map((s) => (
              <li key={s.id} className="flex items-baseline justify-between gap-3 py-4">
                <span className="text-ink">
                  <span className="font-bold">{s.displayName}</span>
                  {s.fromAreaName && <span className="text-ink-soft"> · {s.fromAreaName}</span>}
                </span>
                <span className="font-bold text-ink tnum">
                  {s.amountCents === null ? "—" : formatZAR(s.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
