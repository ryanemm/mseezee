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
    <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 pt-0.5 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
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
            className={`shrink-0 rounded-full border px-4 py-2 text-[0.88rem] font-semibold transition-[background-color,box-shadow,color] ${
              isActive
                ? "border-forest bg-[linear-gradient(180deg,var(--forest-bright),var(--forest))] text-surface shadow-[0_6px_14px_-5px_rgba(31,74,52,0.55),inset_0_1px_0_rgba(255,255,255,0.2)]"
                : "border-gold-line/45 bg-surface text-ink shadow-pill hover:border-gold-line"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
