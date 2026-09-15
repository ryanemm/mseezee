import Link from "next/link";
import { CIRCLE_TYPES } from "@mseezee/shared";

const TABS = [
  { key: "all", label: "All" },
  ...CIRCLE_TYPES.map((t) => ({ key: t.key, label: t.shortLabel })),
];

export function FilterTabs({
  active,
  areaSlug,
}: {
  active: string;
  areaSlug: string;
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const href =
          tab.key === "all"
            ? `/?area=${areaSlug}`
            : `/?area=${areaSlug}&type=${tab.key}`;
        return (
          <Link
            key={tab.key}
            href={href}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-forest bg-forest text-surface"
                : "border-line bg-surface text-ink-soft hover:border-ink-faint"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
