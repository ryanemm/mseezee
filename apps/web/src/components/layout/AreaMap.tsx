"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { Area } from "@mseezee/shared";

// Leaflet touches `window` at import time, so the real map only ever loads
// in the browser — this is the standard Next.js + Leaflet pairing.
const AreaMapInner = dynamic(() => import("./AreaMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-xs text-ink-faint">
      Loading map…
    </div>
  ),
});

export function AreaMap({
  areas,
  current,
  near,
}: {
  areas: Area[];
  /** The one area in scope, if the viewer explicitly picked one (a pin tap,
   *  `?area=`, or a remembered choice). Unset for the national default view
   *  and whenever "find circles near me" is active — `near` takes over then. */
  current?: string;
  /** Raw device coordinates from "find circles near me" — frames the map on
   *  the viewer's own position instead of a single area. */
  near?: { lat: number; lng: number } | null;
}) {
  return (
    <div className="flex flex-col">
      {/* The map is its own rounded card, stacked above the caption card so its
          shadow falls onto it. `isolate` keeps Leaflet's internal z-indexes (up
          to 1000) from climbing over the sticky header and floating nav. */}
      <div className="mz-map relative isolate z-10 h-56 w-full overflow-hidden rounded-[26px] border border-line bg-surface shadow-[0_1px_2px_rgba(27,36,29,0.06),0_20px_30px_-12px_rgba(27,36,29,0.32)] lg:h-80">
        <AreaMapInner areas={areas} current={current} near={near} />
      </div>

      <div className="-mt-[26px] flex flex-col gap-2 rounded-b-[26px] border border-t-0 border-line bg-surface px-4 pb-3.5 pt-[2.4rem] shadow-pill sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <span className="text-[0.78rem] leading-relaxed text-ink-soft">
          Approximate areas only — never a home address.
        </span>
        <Link
          href="/explore"
          className="shrink-0 self-end whitespace-nowrap text-[0.85rem] font-semibold text-ink sm:self-auto sm:pt-0.5"
        >
          Browse by name <span className="text-gold-line">→</span>
        </Link>
      </div>
    </div>
  );
}
