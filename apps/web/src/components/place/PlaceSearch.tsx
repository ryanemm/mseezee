"use client";

import { useEffect, useId, useRef, useState } from "react";
import { findCircleType, formatZAR } from "@mseezee/shared";
import type { CircleSearchResult, PlaceSearchResult } from "@/lib/places";

/**
 * Type-ahead search over Stats SA places — and, when `onSelectCircle` is
 * given, over circles too (shown first, as their own group). Shows "Orlando West" with
 * "Soweto · City of Johannesburg" under it, since the same name often exists
 * in several places ("Mountain View" appears nine times).
 */
export function PlaceSearch({
  onSelect,
  onSelectCircle,
  placeholder = "Search a suburb, township or town",
  showCircleCounts = false,
  autoFocus = false,
  variant = "field",
}: {
  onSelect: (place: PlaceSearchResult) => void;
  onSelectCircle?: (circle: CircleSearchResult) => void;
  placeholder?: string;
  /** Explore shows how many circles each result has; creating a circle doesn't need it. */
  showCircleCounts?: boolean;
  autoFocus?: boolean;
  /** `field`: a form input. `pill`: the big grey search bar on home. `float`:
   *  the same bar in white, floating over the map. */
  variant?: "field" | "pill" | "float";
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [circles, setCircles] = useState<CircleSearchResult[]>([]);
  const withCircles = Boolean(onSelectCircle);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const latest = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setCircles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ticket = ++latest.current;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/places?q=${encodeURIComponent(q)}${withCircles ? "&circles=1" : ""}`,
        );
        const data = (await res.json()) as {
          places?: PlaceSearchResult[];
          circles?: CircleSearchResult[];
        };
        // A slower, older request finishing late mustn't overwrite newer results.
        if (ticket === latest.current) {
          setResults(data.places ?? []);
          setCircles(data.circles ?? []);
        }
      } catch {
        if (ticket === latest.current) {
          setResults([]);
          setCircles([]);
        }
      } finally {
        if (ticket === latest.current) setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, withCircles]);

  function reset() {
    setQuery("");
    setResults([]);
    setCircles([]);
    setOpen(false);
  }
  function choose(place: PlaceSearchResult) {
    onSelect(place);
    reset();
  }
  function chooseCircle(circle: CircleSearchResult) {
    onSelectCircle?.(circle);
    reset();
  }
  const nothing = results.length === 0 && circles.length === 0;

  const showList = open && query.trim().length >= 2;

  return (
    <div className="relative">
      <div
        className={
          variant === "field"
            ? "flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3.5 focus-within:border-ink"
            : `flex h-14 items-center gap-3 rounded-full px-5 focus-within:ring-2 focus-within:ring-ink ${
                variant === "float" ? "bg-surface shadow-pill" : "bg-surface-sunk"
              }`
        }
      >
        <SearchIcon large={variant !== "field"} />
        <input
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          autoFocus={autoFocus}
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`w-full bg-transparent text-ink placeholder:text-ink-soft focus:outline-none ${
            variant === "field" ? "text-sm" : "text-base"
          }`}
        />
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-3xl border border-line bg-surface py-2 shadow-float"
        >
          {loading && nothing && (
            <li className="px-4 py-3 text-sm text-ink-faint">Searching…</li>
          )}
          {!loading && nothing && (
            <li className="px-4 py-3 text-sm text-ink-faint">
              Nothing matches &ldquo;{query.trim()}&rdquo;. Try a nearby suburb or the
              town name.
            </li>
          )}
          {circles.length > 0 && <GroupLabel>Circles</GroupLabel>}
          {circles.map((c) => (
            <li key={c.slug} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => chooseCircle(c)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-surface-sunk"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{c.title}</span>
                  <span className="block truncate text-xs text-ink-faint">
                    {findCircleType(c.type)?.shortLabel ?? c.type} · {c.placeName}
                    {c.isDemo ? " · Example" : ""}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold text-ink tnum">
                  {formatZAR(c.raisedCents, { compact: true })}
                </span>
              </button>
            </li>
          ))}
          {circles.length > 0 && results.length > 0 && <GroupLabel>Places</GroupLabel>}
          {results.map((p) => (
            <li key={p.id} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => choose(p)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-surface-sunk"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{p.name}</span>
                  <span className="block truncate text-xs text-ink-faint">
                    {p.kind === "sub" ? `${p.mainPlaceName} · ` : ""}
                    {p.municipality} · {p.province}
                  </span>
                </span>
                {showCircleCounts && (
                  <span
                    className={`shrink-0 text-xs font-semibold ${
                      p.circleCount > 0 ? "text-ink" : "text-ink-faint"
                    }`}
                  >
                    {p.circleCount > 0
                      ? `${p.circleCount} ${p.circleCount === 1 ? "circle" : "circles"}`
                      : "No circles"}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <li
      role="presentation"
      className="px-4 pb-1 pt-2.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-faint"
    >
      {children}
    </li>
  );
}

function SearchIcon({ large }: { large: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${large ? "size-6 text-ink" : "size-[18px] text-ink-faint"}`}
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m16.5 16.5 3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
