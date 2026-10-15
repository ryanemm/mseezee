import type { Circle } from "@mseezee/shared";
import { formatZAR } from "@mseezee/shared";
import { ArrowCta } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CountUp } from "@/components/ui/CountUp";
import { VerifiedChip } from "@/components/ui/Chip";
import { HeartIcon } from "@/components/ui/Icons";
import { contributionBlock } from "@/lib/contributions-open";

/** The desktop (`lg`+) equivalent of the mobile `ContributeBar` — a sticky
 *  card in the circle page's right column, always visible while reading. */
export function ContributeRail({ circle }: { circle: Circle }) {
  const blocked = contributionBlock(circle);

  return (
    <aside className="hidden w-[22rem] shrink-0 lg:block">
      <div className="sticky top-8 flex flex-col gap-5 rounded-card bg-surface p-6 shadow-card">
        <div>
          <p className="text-[2.2rem] font-extrabold leading-none tracking-tight tnum">
            <CountUp value={circle.raisedCents} />
          </p>
          <p className="mt-1.5 text-ink-soft">
            raised of {formatZAR(circle.goalCents)} goal
          </p>
        </div>

        <ProgressBar
          raisedCents={circle.raisedCents}
          goalCents={circle.goalCents}
          supporterCount={circle.supporterCount}
          thick
        />

        <div className="flex">
          <VerifiedChip tier={circle.verificationTier} />
        </div>

        {blocked ? (
          <span className="flex h-16 items-center justify-center rounded-full bg-surface-sunk px-6 text-center font-semibold text-ink-soft">
            {blocked}
          </span>
        ) : (
          <ArrowCta href={`/circles/${circle.slug}/contribute`}>Give to this circle</ArrowCta>
        )}

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-full bg-surface py-3 text-sm font-bold text-ink shadow-pill transition-colors hover:bg-surface-sunk"
        >
          <HeartIcon className="size-[18px]" />
          Save circle
        </button>

        <div className="border-t border-line pt-4 text-sm">
          <p className="text-ink-soft">Funds received by</p>
          <p className="font-bold text-ink">
            {circle.proxyName ?? `${circle.beneficiaryName} (verified)`}
          </p>
        </div>
      </div>
    </aside>
  );
}
