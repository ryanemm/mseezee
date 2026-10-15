import Link from "next/link";
import type { CircleType } from "@mseezee/shared";
import { CIRCLE_TYPES } from "@mseezee/shared";
import { CircleEmblem } from "@/components/ui/CoverArt";
import { GridIcon } from "@/components/ui/Icons";

const TABS: { key: CircleType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  ...CIRCLE_TYPES.map((t) => ({ key: t.key, label: t.shortLabel })),
];

export function FilterTabs({
  active,
  baseParams,
  counts,
}: {
  active: string;
  /** Whichever params describe the current mode (`{ lat, lng }`, or `{}` for
   *  the default view) — carried along so switching a tab never drops the
   *  viewer's "near me" choice. */
  baseParams: Record<string, string>;
  /** How many circles each tab holds, keyed like the tabs ("all", "funeral"…). */
  counts: Record<string, number>;
}) {
  return (
    <div className="rail -mx-5 gap-2.5 px-5 lg:mx-0 lg:px-0">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const params = new URLSearchParams(baseParams);
        if (tab.key !== "all") params.set("type", tab.key);
        const href = `/?${params.toString()}`;
        return (
          <Pill
            key={tab.key}
            href={href}
            active={isActive}
            count={counts[tab.key] ?? 0}
            icon={
              tab.key === "all" ? (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lime text-on-lime">
                  <GridIcon className="size-[18px]" />
                </span>
              ) : (
                <CircleEmblem type={tab.key} className="size-9 rounded-full" />
              )
            }
          >
            {tab.label}
          </Pill>
        );
      })}
    </div>
  );
}

/** A filter pill: white and lifted when off, solid near-black when on. An
 *  optional emblem sits at its left edge and a count at its right. */
export function Pill({
  href,
  active,
  icon,
  count,
  children,
}: {
  href: string;
  active: boolean;
  icon?: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`flex h-12 shrink-0 items-center gap-2 rounded-full text-[0.95rem] font-semibold shadow-pill transition-[background-color,color,transform] hover:-translate-y-px active:scale-[0.97] ${
        icon ? "pl-1.5" : "pl-5"
      } ${count !== undefined ? "pr-2" : "pr-5"} ${
        active ? "bg-night text-on-night" : "bg-surface text-ink"
      }`}
    >
      {icon}
      <span className="whitespace-nowrap">{children}</span>
      {count !== undefined && (
        <span
          className={`min-w-7 rounded-full px-2 py-1 text-center text-[0.72rem] font-bold leading-none tnum ${
            active ? "bg-lime text-on-lime" : "bg-surface-sunk text-ink-soft"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
