"use client";

import { useEffect, useId, useRef, useState } from "react";
import { findCircleType, formatZAR } from "@mseezee/shared";
import type { CircleSearchResult, PlaceSearchResult } from "@/lib/places";
import { CircleEmblem } from "@/components/ui/CoverArt";
import { PinIcon, SearchIcon } from "@/components/ui/Icons";

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
  trailing,
}: {
  onSelect: (place: PlaceSearchResult) => void;
  onSelectCircle?: (circle: CircleSearchResult) => void;
  placeholder?: string;
  /** Explore shows how many circles each result has; creating a circle doesn't need it. */
  showCircleCounts?: boolean;
  autoFocus?: boolean;
  /** `field`: a form input. `bar`: the big white search bar on home.
   *  `float`: the same bar floating over the map, with a deeper shadow. */
  variant?: "field" | "bar" | "float";
  /** A control tucked into the right end of the bar, e.g. "near me". */
  trailing?: React.ReactNode;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  // Close the list on a tap outside the search, or on Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

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
  function clear() {
    setQuery("");
    inputRef.current?.focus();
  }
  const nothing = results.length === 0 && circles.length === 0;
  const q = query.trim();
  const showList = open && q.length >= 2;
  const isBar = variant !== "field";

  return (
    <div ref={rootRef} className="relative">
      <div
        className={
          isBar
            ? `search-bar ${variant === "float" ? "search-bar-float" : ""} ${trailing ? "pr-2" : "pr-4"}`
            : "field-within flex items-center gap-2.5 px-4 py-3.5"
        }
      >
        <SearchIcon className={`shrink-0 ${isBar ? "size-6 text-ink" : "size-[18px] text-ink-faint"}`} />
        <input
          ref={inputRef}
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
          className={`min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-soft focus:outline-none [&::-webkit-search-cancel-button]:hidden ${
            isBar ? "text-base" : "text-[0.95rem]"
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-faint/25 text-ink-soft transition-colors hover:bg-ink-faint/40 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {trailing}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="mz-pop absolute inset-x-0 top-full z-30 mt-2.5 max-h-96 overflow-y-auto rounded-[28px] bg-surface p-2 shadow-float"
        >
          {loading && nothing && (
            <li className="flex items-center gap-3 px-3 py-3 text-sm text-ink-soft">
              <span className="size-4 animate-spin rounded-full border-2 border-line border-t-ink" aria-hidden="true" />
              Searching…
            </li>
          )}
          {!loading && nothing && (
            <li className="px-3 py-3 text-sm text-ink-soft">
              Nothing matches &ldquo;{q}&rdquo;. Try a nearby suburb or the town name.
            </li>
          )}
          {circles.length > 0 && <GroupLabel count={circles.length}>Circles</GroupLabel>}
          {circles.map((c) => (
            <li key={c.slug} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => chooseCircle(c)}
                className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-surface-sunk"
              >
                <CircleEmblem type={c.type} className="size-11 rounded-xl" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">
                    <Highlight text={c.title} query={q} />
                  </span>
                  <span className="block truncate text-[0.82rem] text-ink-soft">
                    {findCircleType(c.type)?.shortLabel ?? c.type} · {c.placeName}
                    {c.isDemo ? " · Example" : ""}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-surface-sunk px-2.5 py-1 text-xs font-bold text-ink tnum">
                  {formatZAR(c.raisedCents, { compact: true })}
                </span>
              </button>
            </li>
          ))}
          {results.length > 0 && (circles.length > 0 || withCircles) && (
            <GroupLabel count={results.length}>Places</GroupLabel>
          )}
          {results.map((p) => (
            <li key={p.id} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => choose(p)}
                className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-surface-sunk"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-sunk text-ink">
                  <PinIcon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">
                    <Highlight text={p.name} query={q} />
                  </span>
                  <span className="block truncate text-[0.82rem] text-ink-soft">
                    {p.kind === "sub" ? `${p.mainPlaceName} · ` : ""}
                    {p.municipality} · {p.province}
                  </span>
                </span>
                {showCircleCounts && (
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      p.circleCount > 0 ? "bg-lime text-on-lime" : "text-ink-faint"
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

function GroupLabel({ children, count }: { children: React.ReactNode; count: number }) {
  return (
    <li
      role="presentation"
      className="flex items-center gap-2 px-3 pb-1.5 pt-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-faint"
    >
      {children}
      <span className="rounded-full bg-surface-sunk px-1.5 py-0.5 tracking-normal tnum">{count}</span>
    </li>
  );
}

/** Marks where the typed text appears in a result — case-insensitive, first match only. */
function Highlight({ text, query }: { text: string; query: string }) {
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (!query || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[3px] bg-lime/70 text-on-lime">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}
