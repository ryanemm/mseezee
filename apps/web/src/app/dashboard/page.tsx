import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatZAR } from "@mseezee/shared";
import { auth } from "@/auth";
import { getMyOrganiserView } from "@/lib/api";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CircleEmblem } from "@/components/ui/CoverArt";
import { PlusIcon } from "@/components/ui/Icons";
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 pt-[calc(env(safe-area-inset-top)+1.75rem)] lg:px-8 lg:pt-10">
      <header className="flex flex-col gap-2">
        <p className="eyebrow">Organiser</p>
        <h1 className="text-[2.2rem] font-extrabold leading-[1.05] tracking-[-0.035em]">
          Good day, {firstName}
        </h1>
        {view.circles.length > 0 && (
          <p className="text-ink-soft tnum">
            {view.circles.length} active{" "}
            {view.circles.length === 1 ? "circle" : "circles"} ·{" "}
            {formatZAR(totalSettled, { compact: true })} received ·{" "}
            {totalSupporters} supporters
          </p>
        )}
      </header>

      {needsThanks > 0 && (
        <div className="rounded-3xl bg-lime px-5 py-4 text-on-lime shadow-lime">
          <span className="font-bold">{needsThanks} supporters</span> are
          waiting for a thank-you.
        </div>
      )}

      {view.circles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-card border-2 border-dashed border-line px-5 py-12 text-center">
          <p className="text-lg font-bold text-ink">No circles yet</p>
          <p className="max-w-xs text-ink-soft">
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
              className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-card transition-transform active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <CircleEmblem type={circle.type} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[1.15rem] font-bold text-ink">{circle.title}</h2>
                  <p className="truncate text-[0.85rem] text-ink-soft">
                    {circle.area.name}
                    {circle.areaSection ? ` · ${circle.areaSection}` : ""} · Circle{" "}
                    {circle.slug}
                  </p>
                </div>
                {unthankedCount > 0 && (
                  <span className="shrink-0 rounded-full bg-lime px-2.5 py-1 text-[0.72rem] font-bold text-on-lime">
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
                <p className="text-[0.8rem] text-ink-soft">
                  Last contribution {relativeDay(lastContributionAt)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/create"
        className="flex items-center justify-center gap-2 rounded-full bg-night py-4 font-bold text-on-night"
      >
        <PlusIcon className="size-5" />
        Start {view.circles.length === 0 ? "your first" : "another"} circle
      </Link>
    </div>
  );
}
