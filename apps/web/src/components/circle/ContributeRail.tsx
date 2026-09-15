import type { Circle } from "@mseezee/shared";
import { formatZAR } from "@mseezee/shared";
import { ButtonLink } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { VerifiedChip } from "@/components/ui/Chip";

/** The desktop (`lg`+) equivalent of the mobile `ContributeBar` — a sticky
 *  card in the circle page's right column, always visible while reading. */
export function ContributeRail({ circle }: { circle: Circle }) {
  const closed = circle.status === "closed";

  return (
    <aside className="hidden w-[21rem] shrink-0 lg:block">
      <div className="sticky top-24 flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card">
        <div>
          <p className="font-display text-3xl text-forest tnum">
            {formatZAR(circle.raisedCents)}
          </p>
          <p className="text-sm text-ink-faint">
            raised of {formatZAR(circle.goalCents)} goal
          </p>
        </div>

        <ProgressBar
          raisedCents={circle.raisedCents}
          goalCents={circle.goalCents}
          supporterCount={circle.supporterCount}
        />

        <VerifiedChip tier={circle.verificationTier} />

        {closed ? (
          <span className="rounded-full bg-surface-sunk py-3 text-center text-sm font-semibold text-ink-faint">
            This circle is closed
          </span>
        ) : (
          <ButtonLink href={`/circles/${circle.slug}/contribute`} className="w-full">
            Contribute
          </ButtonLink>
        )}

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-full border border-line py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface-sunk"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 20s-7-4.4-7-9.6A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 7 3.4C19 15.6 12 20 12 20z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          Save circle
        </button>

        <div className="border-t border-line pt-3.5 text-sm">
          <p className="text-ink-faint">Funds received by</p>
          <p className="font-medium text-ink">
            {circle.proxyName ?? `${circle.beneficiaryName} (verified)`}
          </p>
        </div>
      </div>
    </aside>
  );
}
