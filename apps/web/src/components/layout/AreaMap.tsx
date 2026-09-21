"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Area } from "@mseezee/shared";
import { distanceKm } from "@mseezee/shared";
import { selectArea } from "@/lib/select-area";

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
}: {
  areas: Area[];
  current: string;
}) {
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  function findNearMe() {
    if (!("geolocation" in navigator)) {
      setLocateError("Your browser doesn't support finding your location.");
      return;
    }
    setLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const { latitude, longitude } = position.coords;
        const nearest = areas.reduce<{ area: Area; km: number } | null>((best, area) => {
          const km = distanceKm({ lat: latitude, lng: longitude }, { lat: area.lat, lng: area.lng });
          return !best || km < best.km ? { area, km } : best;
        }, null);
        if (!nearest) {
          setLocateError("Couldn't match that to an area yet.");
          return;
        }
        selectArea(router, nearest.area.slug);
      },
      (err) => {
        setLocating(false);
        setLocateError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was declined — pick an area on the map instead."
            : "Couldn't get your location. Pick an area on the map instead.",
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 },
    );
  }

  return (
    <div className="flex flex-col">
      {/* The map is its own rounded card, stacked above the caption card so its
          shadow falls onto it. `isolate` keeps Leaflet's internal z-indexes (up
          to 1000) from climbing over the sticky header and floating nav. */}
      <div className="mz-map relative isolate z-10 h-56 w-full overflow-hidden rounded-[26px] border border-line bg-surface shadow-[0_1px_2px_rgba(27,36,29,0.06),0_20px_30px_-12px_rgba(27,36,29,0.32)] lg:h-80">
        <AreaMapInner areas={areas} current={current} />
        <button
          type="button"
          onClick={findNearMe}
          disabled={locating}
          className="absolute right-3 top-3 z-[1100] flex items-center gap-2 rounded-full border border-white/70 bg-surface/95 px-4 py-2.5 text-sm font-semibold text-ink shadow-[0_6px_18px_-4px_rgba(27,36,29,0.3)] backdrop-blur transition-[background-color,transform] hover:bg-surface active:scale-[0.98] disabled:opacity-60"
        >
          <LocateIcon />
          {locating ? "Locating…" : "Find circles near me"}
        </button>
      </div>

      <div className="-mt-[26px] flex flex-col gap-2 rounded-b-[26px] border border-t-0 border-line bg-surface px-4 pb-3.5 pt-[2.4rem] shadow-pill">
        {locateError && <p className="text-xs text-crit">{locateError}</p>}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <span className="text-[0.78rem] leading-relaxed text-ink-soft">
            Approximate areas only — never a home address. Your location is used
            once to pick the nearest area, and never stored.
          </span>
          <Link
            href="/explore"
            className="shrink-0 self-end whitespace-nowrap text-[0.85rem] font-semibold text-ink sm:self-auto sm:pt-0.5"
          >
            Browse by name <span className="text-gold-line">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function LocateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v3M12 19v3M2 12h3M19 12h3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
