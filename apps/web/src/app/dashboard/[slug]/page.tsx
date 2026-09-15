import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { DisbursementList } from "@/components/dashboard/DisbursementList";
import { ProgressBar } from "@/components/ui/ProgressBar";
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-5 lg:px-8">
      <header className="flex flex-col gap-2">
        <Link href="/dashboard" className="text-sm font-semibold text-forest">
          ← Your circles
        </Link>
        <h1 className="text-xl">{circle.title}</h1>
        <p className="text-xs text-ink-faint">
          {circle.proxyName
            ? `Funds held by ${circle.proxyName}`
            : "Funds paid to the verified beneficiary"}{" "}
          · Circle {circle.slug}
        </p>
      </header>

      <StatTiles
        items={[
          { label: "Received", value: formatZAR(dash.settledCents, { compact: true }), tone: "forest" },
          { label: "Clearing", value: formatZAR(dash.pendingCents, { compact: true }), tone: "gold" },
          { label: "Paid out", value: formatZAR(dash.disbursedCents, { compact: true }), tone: "ink" },
        ]}
      />

      <section className="flex flex-col gap-2">
        <ProgressBar
          raisedCents={dash.settledCents}
          goalCents={circle.goalCents}
          supporterCount={circle.supporterCount}
        />
        {dash.lastContributionAt && (
          <p className="text-xs text-ink-faint">
            Last contribution {relativeDay(dash.lastContributionAt)}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg">Manage</h2>
        <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface shadow-card">
          {menu.map((m) => (
            <li key={m.label}>
              <Link
                href={m.href}
                className="flex items-center justify-between gap-3 p-3.5 text-sm"
              >
                <span className="font-medium text-ink">{m.label}</span>
                <span className="flex items-center gap-2">
                  {m.badge !== undefined && m.badge > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[0.62rem] font-semibold ${
                        m.alert
                          ? "bg-gold-soft text-gold"
                          : "bg-surface-sunk text-ink-faint"
                      }`}
                    >
                      {m.badge}
                    </span>
                  )}
                  <span className="text-ink-faint">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="payouts" className="flex flex-col gap-2 scroll-mt-6">
        <h2 className="text-lg">Payouts</h2>
        <DisbursementList disbursements={dash.disbursements} />
        <p className="text-[0.78rem] text-ink-soft">
          {circle.proxyName
            ? `${circle.proxyName} releases funds to the family and records what each payout covered.`
            : "Request a payout once you have a quote or invoice to attach."}
        </p>
      </section>

      <section id="messages" className="flex flex-col gap-2 scroll-mt-6">
        <h2 className="text-lg">Messages &amp; thank-you</h2>
        <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface shadow-card">
          {thankYous.map((t) => (
            <li key={t.id} className="flex flex-col gap-1 p-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-ink">
                  {t.supporterName}
                </span>
                <span className="text-xs font-semibold text-forest tnum">
                  {t.amountCents === null ? "—" : formatZAR(t.amountCents)}
                </span>
              </div>
              {t.supporterMessage && (
                <p className="text-[0.85rem] text-ink-soft">
                  “{t.supporterMessage}”
                </p>
              )}
              <span
                className={`mt-0.5 self-start rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide ${
                  t.thanked
                    ? "bg-good/10 text-good"
                    : "bg-gold-soft text-gold"
                }`}
              >
                {t.thanked ? "Thanked" : "Send a thank-you"}
              </span>
            </li>
          ))}
          {thankYous.length === 0 && (
            <li className="p-4 text-center text-sm text-ink-faint">
              No messages yet.
            </li>
          )}
        </ul>
      </section>

      {supporters.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg">Recent contributions</h2>
          <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface shadow-card">
            {supporters.map((s) => (
              <li
                key={s.id}
                className="flex items-baseline justify-between gap-3 p-3.5 text-sm"
              >
                <span className="text-ink">
                  {s.displayName}
                  {s.fromAreaName && (
                    <span className="text-ink-faint"> · {s.fromAreaName}</span>
                  )}
                </span>
                <span className="font-semibold text-forest tnum">
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
