"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * The primary way to switch the home feed from "top circles everywhere" to
 * "closest to me" — deliberately the boldest thing above the fold, since
 * that's the one action that needs a real decision (sharing device location)
 * from the viewer. A tap re-sorts the circle list by true distance; it
 * doesn't scope to one area the way tapping a map pin does.
 *
 * Coordinates only ever travel as a one-off `?lat=&lng=` on this navigation —
 * read once by the server to sort that single response, never written to a
 * cookie or any other store.
 */
export function FindNearMeButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function findNearMe() {
    if (!("geolocation" in navigator)) {
      setError("Your browser doesn't support finding your location.");
      return;
    }
    // Browsers silently refuse geolocation on a page that isn't HTTPS (or
    // exactly "localhost") — no permission prompt ever appears, and the
    // resulting error looks identical to a real decline. Catching it here
    // gives an accurate message instead of blaming the browser's own prompt.
    if (!window.isSecureContext) {
      setError(
        "This page isn't served securely, so the browser won't share location here.",
      );
      return;
    }
    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const params = new URLSearchParams();
        params.set("lat", position.coords.latitude.toFixed(4));
        params.set("lng", position.coords.longitude.toFixed(4));
        const type = searchParams.get("type");
        if (type) params.set("type", type);
        router.push(`/?${params.toString()}`);
        router.refresh();
      },
      (err) => {
        setLocating(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access is blocked for this site — check your browser's site settings or your device's location settings, or pick an area on the map instead."
            : "Couldn't get your location. Pick an area on the map instead.",
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 },
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={findNearMe}
        disabled={locating}
        className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[linear-gradient(180deg,var(--forest-bright)_0%,var(--forest)_100%)] px-6 py-4 text-[1.02rem] font-semibold text-surface shadow-[0_10px_22px_-8px_rgba(31,74,52,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] transition-[filter,transform] hover:brightness-110 active:scale-[0.99] disabled:opacity-70"
      >
        <LocateIcon />
        {locating ? "Finding your area…" : "Find circles near me"}
      </button>
      {error && <p className="px-1 text-xs text-crit">{error}</p>}
    </div>
  );
}

function LocateIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
