"use client";

import dynamic from "next/dynamic";
import type { PlaceSummary } from "@mseezee/shared";
import type { FramePadding, MapFocus } from "./AreaMapInner";

// Leaflet touches `window` at import time, so the real map only ever loads
// in the browser — this is the standard Next.js + Leaflet pairing.
const AreaMapInner = dynamic(() => import("./AreaMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#e4e3de] text-xs text-ink-faint">
      Loading map…
    </div>
  ),
});

/** The map itself, filling whatever box it's given. `isolate` keeps Leaflet's
 *  internal z-indexes (up to 1000) from climbing over overlays and the nav. */
export function AreaMap({
  places,
  near,
  highlightId,
  padding,
  embedded,
  focus,
  frame,
  className = "",
}: {
  /** Places with circles — one amount pin each. */
  places: PlaceSummary[];
  /** Raw device coordinates from "find circles near me" — frames the map on
   *  the viewer's own position instead of every place. */
  near?: { lat: number; lng: number } | null;
  /** The place drawn as the big lime pin. */
  highlightId?: string;
  /** Room to keep clear when framing, for anything laid over the map. */
  padding?: FramePadding;
  /** Set inside a scrolling page rather than filling the screen. */
  embedded?: boolean;
  /** A chosen place to fly to and label. */
  focus?: MapFocus | null;
  /** With nothing chosen: frame South Africa (default), or just the places. */
  frame?: "country" | "places";
  className?: string;
}) {
  return (
    <div className={`mz-map isolate ${className}`}>
      <AreaMapInner
        places={places}
        near={near}
        highlightId={highlightId}
        padding={padding}
        embedded={embedded}
        focus={focus}
        frame={frame}
      />
    </div>
  );
}
