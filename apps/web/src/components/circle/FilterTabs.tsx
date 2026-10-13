import Link from "next/link";
import { CIRCLE_TYPES } from "@mseezee/shared";

const TABS = [
  { key: "all", label: "All" },
  ...CIRCLE_TYPES.map((t) => ({ key: t.key, label: t.shortLabel })),
];

export function FilterTabs({
  active,
  baseParams,
}: {
  active: string;
  /** Whichever params describe the current mode (`{ lat, lng }`, or `{}` for
   *  the default view) — carried along so switching a tab never drops the
   *  viewer's "near me" choice. */
  baseParams: Record<string, string>;
}) {
  return (
    <div className="rail -mx-5 gap-2.5 px-5 lg:mx-0 lg:px-0">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const params = new URLSearchParams(baseParams);
        if (tab.key !== "all") params.set("type", tab.key);
        const href = `/?${params.toString()}`;
        return (
          <Pill key={tab.key} href={href} active={isActive}>
            {tab.label}
          </Pill>
        );
      })}
    </div>
  );
}

/** A filter pill: solid near-black when on; light grey when off, or white
 *  with a shadow when it floats over the map. */
export function Pill({
  href,
  active,
  floating = false,
  children,
}: {
  href: string;
  active: boolean;
  floating?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`flex h-12 shrink-0 items-center rounded-full px-6 text-[0.98rem] font-semibold transition-colors ${
        active
          ? "bg-night text-on-night"
          : floating
            ? "bg-surface text-ink shadow-pill hover:bg-surface-sunk"
            : "bg-surface-sunk text-ink hover:bg-line"
      }`}
    >
      {children}
    </Link>
  );
}
