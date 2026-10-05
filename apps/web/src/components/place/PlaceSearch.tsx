"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PlaceSearchResult } from "@/lib/places";

/**
 * Type-ahead search over Stats SA places. Shows "Orlando West" with
 * "Soweto · City of Johannesburg" under it, since the same name often exists
 * in several places ("Mountain View" appears nine times).
 */
export function PlaceSearch({
  onSelect,
  placeholder = "Search a suburb, township or town",
  showCircleCounts = false,
  autoFocus = false,
}: {
  onSelect: (place: PlaceSearchResult) => void;
  placeholder?: string;
  /** Explore shows how many circles each result has; creating a circle doesn't need it. */
  showCircleCounts?: boolean;
  autoFocus?: boolean;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const latest = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ticket = ++latest.current;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { places?: PlaceSearchResult[] };
        // A slower, older request finishing late mustn't overwrite newer results.
        if (ticket === latest.current) setResults(data.places ?? []);
      } catch {
        if (ticket === latest.current) setResults([]);
      } finally {
        if (ticket === latest.current) setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  function choose(place: PlaceSearchResult) {
    onSelect(place);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  const showList = open && query.trim().length >= 2;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 focus-within:border-forest">
        <SearchIcon />
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
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-line bg-surface py-1 shadow-card"
        >
          {loading && results.length === 0 && (
            <li className="px-3.5 py-3 text-sm text-ink-faint">Searching…</li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-3.5 py-3 text-sm text-ink-faint">
              No places match &ldquo;{query.trim()}&rdquo;. Try a nearby suburb or the
              town name.
            </li>
          )}
          {results.map((p) => (
            <li key={p.id} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => choose(p)}
                className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-surface-sunk"
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
                      p.circleCount > 0 ? "text-forest" : "text-ink-faint"
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

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-ink-faint">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
