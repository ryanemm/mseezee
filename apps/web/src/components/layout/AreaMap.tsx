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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">Circles near you</p>
        <button
          type="button"
          onClick={findNearMe}
          disabled={locating}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-forest shadow-sm transition-colors hover:bg-surface-sunk disabled:opacity-60"
        >
          <LocateIcon />
          {locating ? "Locating…" : "Find circles near me"}
        </button>
      </div>

      {locateError && <p className="text-xs text-crit">{locateError}</p>}

      <div className="h-64 w-full overflow-hidden rounded-card border border-line bg-surface-sunk shadow-card lg:h-80">
        <AreaMapInner areas={areas} current={current} />
      </div>

      <div className="flex items-center justify-between gap-3 px-1">
        <span className="text-[0.7rem] text-ink-faint">
          Approximate areas — never a home address. "Find circles near me"
          checks your device's location once, to pick the nearest area; the
          coordinates themselves are never stored.
        </span>
        <Link href="/explore" className="shrink-0 text-[0.7rem] font-semibold text-forest">
          Browse by name →
        </Link>
      </div>
    </div>
  );
}

function LocateIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
