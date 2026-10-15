import { ArrowCta } from "@/components/ui/Button";

/** The fixed bottom "Give" bar for phone/tablet widths. At `lg` and above
 *  the circle page shows a sticky `ContributeRail` in a right column instead. */
export function ContributeBar({
  slug,
  blocked,
}: {
  slug: string;
  /** Why contributions are off (see `contributionBlock`), or null if open. */
  blocked: string | null;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 bg-surface/95 shadow-bar px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 backdrop-blur md:left-64 lg:hidden">
      <div className="mx-auto w-full max-w-xl">
        {blocked ? (
          <span className="flex h-16 items-center justify-center rounded-full bg-surface-sunk px-6 text-center font-semibold text-ink-soft">
            {blocked}
          </span>
        ) : (
          <ArrowCta href={`/circles/${slug}/contribute`}>Give to this circle</ArrowCta>
        )}
      </div>
    </div>
  );
}
