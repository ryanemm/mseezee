import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatZAR } from "@mseezee/shared";
import { auth } from "@/auth";
import { getMyOrganiserView } from "@/lib/api";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { relativeDay } from "@/lib/format";

export const metadata: Metadata = { title: "Your circles" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/dashboard");
  }

  const view = await getMyOrganiserView(session.user.id);
  const firstName = view.organiserName.split(" ")[0] ?? view.organiserName;

  const totalSettled = view.circles.reduce((s, c) => s + c.settledCents, 0);
  const totalSupporters = view.circles.reduce((s, c) => s + c.supporterCount, 0);
  const needsThanks = view.circles.reduce((s, c) => s + c.unthankedCount, 0);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 lg:px-8">
      <header className="flex flex-col gap-1">
        <p className="eyebrow">Organiser</p>
        <h1 className="text-2xl">Good day, {firstName}</h1>
        {view.circles.length > 0 && (
          <p className="text-sm text-ink-soft">
            {view.circles.length} active{" "}
            {view.circles.length === 1 ? "circle" : "circles"} ·{" "}
            {formatZAR(totalSettled, { compact: true })} received ·{" "}
            {totalSupporters} supporters
          </p>
        )}
      </header>

      {needsThanks > 0 && (
        <div className="rounded-card border border-gold-line bg-gold-soft/50 px-4 py-3 text-sm text-ink">
          <span className="font-semibold">{needsThanks} supporters</span> are
          waiting for a thank-you.
        </div>
      )}

      {view.circles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line bg-surface px-4 py-10 text-center">
          <p className="font-display text-lg text-ink">No circles yet</p>
          <p className="max-w-xs text-sm text-ink-soft">
            When you start one, it'll show up here with its own dashboard —
            contributions, messages, and payouts.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {view.circles.map(({ circle, settledCents, unthankedCount, lastContributionAt }) => (
            <Link
              key={circle.id}
              href={`/dashboard/${circle.slug}`}
              className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg text-ink">{circle.title}</h2>
                  <p className="text-xs text-ink-faint">
                    {circle.area.name}
                    {circle.areaSection ? ` · ${circle.areaSection}` : ""} · Circle{" "}
                    {circle.slug}
                  </p>
                </div>
                {unthankedCount > 0 && (
                  <span className="shrink-0 rounded-full bg-gold-soft px-2 py-0.5 text-[0.62rem] font-semibold text-gold">
                    {unthankedCount} to thank
                  </span>
                )}
              </div>
              <ProgressBar
                raisedCents={settledCents}
                goalCents={circle.goalCents}
                supporterCount={circle.supporterCount}
                compact
              />
              {lastContributionAt && (
                <p className="text-[0.7rem] text-ink-faint">
                  Last contribution {relativeDay(lastContributionAt)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/create"
        className="rounded-card border border-dashed border-line bg-surface px-4 py-4 text-center text-sm font-semibold text-forest"
      >
        + Start {view.circles.length === 0 ? "your first" : "another"} circle
      </Link>
    </div>
  );
}
