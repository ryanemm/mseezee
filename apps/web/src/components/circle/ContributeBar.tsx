import { ButtonLink } from "@/components/ui/Button";

/** The fixed bottom contribute bar for phone/tablet widths. At `lg` and above
 *  the circle page shows a sticky `ContributeRail` in a right column instead. */
export function ContributeBar({
  slug,
  closed,
}: {
  slug: string;
  closed?: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+3.5rem)] z-20 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:bottom-0 md:left-64 lg:hidden">
      <div className="mx-auto flex w-full max-w-xl items-center gap-2">
        <button
          type="button"
          aria-label="Save circle"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 20s-7-4.4-7-9.6A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 7 3.4C19 15.6 12 20 12 20z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {closed ? (
          <span className="flex-1 rounded-full bg-surface-sunk py-3 text-center text-sm font-semibold text-ink-faint">
            This circle is closed
          </span>
        ) : (
          <ButtonLink href={`/circles/${slug}/contribute`} className="flex-1">
            Contribute
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
