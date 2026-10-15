"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  variant = "inline",
  label = false,
  errorBelow = false,
}: {
  /** The page that sorts by `?lat=&lng=` — home, or Explore's map. */
  basePath?: string;
  /** `inline`: the lime button tucked inside the home search bar. `map`:
   *  the white button on a map. */
  variant?: "inline" | "map";
  /** Spell out "Near me" beside the icon on the map button. */
  label?: boolean;
  /** Which way the error note opens — away from the map edge it sits on. */
  errorBelow?: boolean;
}) {
  const router = useRouter();
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
        router.push(`${basePath}?${params.toString()}`, { scroll: false });
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
        className={`flex items-center justify-center gap-2 font-bold transition-transform active:scale-95 disabled:opacity-70 ${
          variant === "map"
            ? `h-14 rounded-full bg-surface text-ink shadow-float ${label ? "px-5 text-[0.95rem]" : "w-14"}`
            : "size-12 rounded-[20px] bg-lime text-sm text-on-lime sm:w-auto sm:px-4"
        }`}
      >
        <LocateIcon className={`size-6 shrink-0 ${locating ? "animate-pulse" : ""}`} />
        {variant === "inline" && (
          <span className="hidden whitespace-nowrap sm:inline">
            {locating ? "Finding…" : "Near me"}
          </span>
        )}
        {variant === "map" && label && (
          <span className="whitespace-nowrap">{locating ? "Finding you…" : "Near me"}</span>
        )}
      </button>
      {error && (
        <p
          role="alert"
          className={`mz-pop absolute right-0 z-30 w-64 rounded-2xl bg-surface p-3 text-xs leading-relaxed text-crit shadow-float ${
            variant === "map" && !errorBelow ? "bottom-full mb-2" : "top-full mt-3"
          }`}
        >
          {error}
        </p>
      )}
    </div>
  );
}
