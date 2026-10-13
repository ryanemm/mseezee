"use client";

import { useId, useState } from "react";

/** The segmented About / Updates / Supporters switcher on a circle page. Every
 *  panel is rendered (just hidden), so all of it is in the page for search
 *  engines and in-page find. */
export function CircleTabs({
  tabs,
}: {
  tabs: { key: string; label: string; count?: number; content: React.ReactNode }[];
}) {
  const id = useId();
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div id="circle-tabs" className="flex scroll-mt-6 flex-col gap-5">
      <div role="tablist" className="flex rounded-full bg-surface-sunk p-1.5">
        {tabs.map((t) => {
          const selected = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`${id}-${t.key}-tab`}
              aria-selected={selected}
              aria-controls={`${id}-${t.key}`}
              onClick={() => setActive(t.key)}
              className={`flex-1 rounded-full px-2 py-3 text-[0.98rem] font-semibold transition-colors ${
                selected ? "bg-night text-on-night" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t.label}
              {t.count ? <span className="ml-1 opacity-60 tnum">{t.count}</span> : null}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.key}
          role="tabpanel"
          id={`${id}-${t.key}`}
          aria-labelledby={`${id}-${t.key}-tab`}
          hidden={t.key !== active}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
