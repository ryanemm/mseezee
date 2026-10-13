import type { Circle } from "@mseezee/shared";
import { CircleEmblem } from "@/components/ui/CoverArt";

/** "Who you're giving to" — the grey card at the top of the Give and Payment steps. */
export function CircleSummary({ circle }: { circle: Circle }) {
  return (
    <div className="flex items-center gap-4 rounded-card bg-surface-sunk p-3 pr-5">
      <CircleEmblem type={circle.type} className="size-[4.5rem] rounded-[20px]" />
      <div className="min-w-0">
        <p className="line-clamp-2 text-[1.05rem] font-bold leading-snug text-ink">
          {circle.title}
        </p>
        <p className="truncate text-[0.92rem] text-ink-soft">
          Supporting {circle.beneficiaryName} · {circle.area.name}
        </p>
      </div>
    </div>
  );
}
