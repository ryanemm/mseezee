import type { Metadata } from "next";
import Link from "next/link";
import { formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { DisbursementList } from "@/components/dashboard/DisbursementList";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const metadata: Metadata = { title: "Partner dashboard" };

export default async function PartnerDashboardPage() {
  const view = await api.getPartnerView();
  const allDisbursements = view.circles.flatMap((c) => c.disbursements);
  const totalReceived = view.circles.reduce((s, c) => s + c.settledCents, 0);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-5 lg:px-8">
      <header className="flex flex-col gap-1">
        <p className="eyebrow">Community partner</p>
        <h1 className="text-2xl">{view.partnerName}</h1>
        <p className="text-sm text-ink-soft">{view.registration}</p>
      </header>

      <StatTiles
        items={[
          { label: "Held now", value: formatZAR(view.heldCents, { compact: true }), tone: "forest" },
          { label: "Received total", value: formatZAR(totalReceived, { compact: true }), tone: "ink" },
          { label: "Need action", value: String(view.awaitingActionCount), tone: "gold" },
        ]}
      />

      {view.awaitingActionCount > 0 && (
        <div className="rounded-card border border-gold-line bg-gold-soft/50 px-4 py-3 text-sm text-ink">
          <span className="font-semibold">
            {view.awaitingActionCount} payout{view.awaitingActionCount === 1 ? "" : "s"}
          </span>{" "}
          need your review before the money reaches a family.
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg">Circles you host</h2>
        {view.circles.map(({ circle, settledCents, disbursedCents }) => (
          <div
            key={circle.id}
            className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href={`/circles/${circle.slug}`}
                  className="font-display text-lg text-ink"
                >
                  {circle.title}
                </Link>
                <p className="text-xs text-ink-faint">
                  Organiser: {circle.organiserName} · {circle.area.name}
                  {circle.areaSection ? ` · ${circle.areaSection}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-right text-xs text-ink-faint">
                Holding
                <span className="block font-semibold text-forest tnum">
                  {formatZAR(settledCents - disbursedCents)}
                </span>
              </span>
            </div>
            <ProgressBar
              raisedCents={settledCents}
              goalCents={circle.goalCents}
              supporterCount={circle.supporterCount}
              compact
            />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg">All payouts</h2>
        <DisbursementList disbursements={allDisbursements} showCircle />
        <p className="text-[0.78rem] text-ink-soft">
          Record each payout with what it covered — an invoice, a quote, or a
          note. This is the record the family and your members can see.
        </p>
      </section>

      <section className="rounded-card bg-forest/5 p-4 text-[0.82rem] text-ink-soft">
        <p className="font-semibold text-ink">How disbursement works</p>
        <p className="mt-1">
          Contributions settle to your organisation's account. You release funds
          to each family the way you always have — paying the funeral home,
          buying what's needed, or handing over cash — and mark the payout here
          so there is a clean trail.
        </p>
      </section>
    </div>
  );
}
