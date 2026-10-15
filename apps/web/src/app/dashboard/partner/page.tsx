import type { Metadata } from "next";
import Link from "next/link";
import { formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { DisbursementList } from "@/components/dashboard/DisbursementList";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CircleEmblem } from "@/components/ui/CoverArt";

export const metadata: Metadata = { title: "Partner dashboard" };
// Shows live held funds — must never be a static snapshot from build time.
export const dynamic = "force-dynamic";

export default async function PartnerDashboardPage() {
  const view = await api.getPartnerView();
  const allDisbursements = view.circles.flatMap((c) => c.disbursements);
  const totalReceived = view.circles.reduce((s, c) => s + c.settledCents, 0);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 pt-[calc(env(safe-area-inset-top)+1.75rem)] lg:px-8 lg:pt-10">
      <header className="flex flex-col gap-2">
        <p className="eyebrow">Community partner</p>
        <h1 className="text-[2.2rem] font-extrabold leading-[1.05] tracking-[-0.035em]">
          {view.partnerName}
        </h1>
        <p className="text-ink-soft">{view.registration}</p>
      </header>

      <StatTiles
        items={[
          { label: "Held now", value: formatZAR(view.heldCents, { compact: true }), tone: "forest" },
          { label: "Received total", value: formatZAR(totalReceived, { compact: true }), tone: "gold" },
          { label: "Need action", value: String(view.awaitingActionCount), tone: "ink" },
        ]}
      />

      {view.awaitingActionCount > 0 && (
        <div className="rounded-3xl bg-lime px-5 py-4 text-on-lime shadow-lime">
          <span className="font-bold">
            {view.awaitingActionCount} payout{view.awaitingActionCount === 1 ? "" : "s"}
          </span>{" "}
          need your review before the money reaches a family.
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-[1.4rem] font-bold">Circles you host</h2>
        {view.circles.map(({ circle, settledCents, disbursedCents }) => (
          <div
            key={circle.id}
            className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-card"
          >
            <div className="flex items-center gap-4">
              <CircleEmblem type={circle.type} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/circles/${circle.slug}`}
                  className="block truncate text-[1.15rem] font-bold text-ink"
                >
                  {circle.title}
                </Link>
                <p className="truncate text-[0.85rem] text-ink-soft">
                  Organiser: {circle.organiserName} · {circle.area.name}
                  {circle.areaSection ? ` · ${circle.areaSection}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-right text-[0.8rem] text-ink-soft">
                Holding
                <span className="block text-base font-bold text-ink tnum">
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

      <section className="flex flex-col gap-3">
        <h2 className="text-[1.4rem] font-bold">All payouts</h2>
        <DisbursementList disbursements={allDisbursements} showCircle />
        <p className="text-[0.88rem] text-ink-soft">
          Record each payout with what it covered — an invoice, a quote, or a
          note. This is the record the family and your members can see.
        </p>
      </section>

      <section className="rounded-card bg-surface shadow-card p-5 text-[0.92rem] text-ink-soft">
        <p className="font-bold text-ink">How disbursement works</p>
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
