"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LocateIcon } from "@/components/ui/Icons";

/**
 * Switches a feed from "top circles everywhere" to "closest to me". A tap
 * re-sorts the circle list by true distance; it doesn't scope to one area the
 * way tapping a map pin does.
 *
 * Coordinates only ever travel as a one-off `?lat=&lng=` on this navigation —
 * read once by the server to sort that single response, never written to a
 * cookie or any other store.
 */
export function FindNearMeButton({
  basePath = "/",
  variant = "dark",
}: {
  /** The page that sorts by `?lat=&lng=` — home, or Explore's map. */
  basePath?: string;
  /** `dark`: the black disc beside the home search. `map`: the white disc on a map. */
  variant?: "dark" | "map";
}) {
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
        router.push(`${basePath}?${params.toString()}`);
        router.refresh();
      },
      (err) => {
        setLocating(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access is blocked for this site — check your browser's site settings or your device's location settings, or search for a place instead."
            : "Couldn't get your location. Search for a place instead.",
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 },
    );
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={findNearMe}
        disabled={locating}
        aria-label={locating ? "Finding your area…" : "Find circles near me"}
        title="Find circles near me"
        className={`flex size-14 items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-70 ${
          variant === "map"
            ? "bg-surface text-ink shadow-float"
            : "bg-night text-on-night"
        }`}
      >
        <LocateIcon className={`size-6 ${locating ? "animate-pulse" : ""}`} />
      </button>
      {error && (
        <p
          role="alert"
          className={`absolute right-0 z-30 w-64 rounded-2xl bg-surface p-3 text-xs leading-relaxed text-crit shadow-float ${
            variant === "map" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {error}
        </p>
      )}
    </div>
  );
}
