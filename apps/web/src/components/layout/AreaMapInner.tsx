"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { usePathname, useRouter } from "next/navigation";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { PlaceSummary } from "@mseezee/shared";
import { formatZAR } from "@mseezee/shared";
import { animate, prefersReducedMotion } from "@/lib/count-up";

/**
 * The actual Leaflet map — loaded only on the client via `next/dynamic` in
 * `AreaMap.tsx`, since Leaflet touches `window` at load time.
 *
 * One amount pin per place that has circles, at the place's centre point (from Stats
 * SA), never a household. The map can't zoom in past township level
 * (`maxZoom`) — "general area" is a hard limit, not a convention. Nothing here reads device location itself — `near`
 * arrives already resolved from a one-off "find circles near me" tap
 * elsewhere on the page.
 */

/** What a bubble says: an optional place name, then an amount (which counts
 *  up) or a line of text. */
type BubbleContent = { name?: string; cents?: number; text?: string };

/** An amount bubble ("R9.8k") with a tail, drawn in HTML so it sizes to its
 *  text — see `.mz-bubble` in globals.css. The marker element itself is 0×0
 *  at the point and the bubble hangs above it. Until `counted`, the amount
 *  reads R0 and carries its total in `data-cents` for `countUpIn`. */
function bubbleIcon(
  content: BubbleContent,
  hot: boolean,
  counted: boolean,
  extraClass = "",
): L.DivIcon {
  const parts: string[] = [];
  if (content.name) parts.push(escapeHtml(content.name));
  if (content.cents !== undefined) {
    const shown = formatZAR(counted ? content.cents : 0, { compact: true });
    parts.push(`<span class="mz-count" data-cents="${content.cents}">${shown}</span>`);
  }
  if (content.text) parts.push(escapeHtml(content.text));
  return L.divIcon({
    className: "mz-pin",
    html: `<div class="mz-bubble${hot ? " mz-bubble-hot" : ""} ${extraClass}">${parts.join(" · ")}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    tooltipAnchor: [0, hot ? -58 : -50],
  });
}

/** The viewer's own position, once "find circles near me" resolves it — a
 *  plain dot in a lime halo, deliberately not another bubble, so it never
 *  reads as "a circle is here." */
function meIcon(): L.DivIcon {
  return L.divIcon({
    className: "mz-pin",
    html: `<svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="31" fill="#d4f26a" fill-opacity="0.55"/>
      <circle cx="32" cy="32" r="10" fill="#151815" stroke="#ffffff" stroke-width="3.5"/>
    </svg>`,
    iconSize: [64, 64],
    iconAnchor: [32, 32],
  });
}

const ICON_ME = meIcon();

/** Place names go into marker HTML — keep them text. */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

/** South Africa's extent — the default view, whatever has circles. */
const SOUTH_AFRICA = L.latLngBounds([-34.9, 16.4], [-22.1, 32.95]);

/** Never zoom tighter than this — township level, keeping it "general area". */
const FRAME_MAX_ZOOM = 9;
/** Zoom used to frame the viewer's own position in "find near me" mode, or
 *  a chosen place — the map's closest zoom, so the area itself fills it. */
const NEAR_ME_ZOOM = 11;

/** A chosen place: the map flies to it and labels it with a lime tag of its
 *  name and total (null when it has no circles yet). */
export type MapFocus = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  raisedCents: number | null;
};

/** Counts every not-yet-counted amount inside `root` up from R0 together;
 *  calls `done` when they land. Returns a cancel. */
function countUpIn(root: Element, done?: () => void): () => void {
  const els = [...root.querySelectorAll<HTMLElement>(".mz-count[data-cents]")];
  return animate((p) => {
    for (const el of els) {
      el.textContent = formatZAR(Math.round(Number(el.dataset.cents) * p), { compact: true });
    }
    if (p === 1) done?.();
  });
}

export type FramePadding = { topLeft: [number, number]; bottomRight: [number, number] };

/** Clear of the search bar and pills laid over the top of the Explore map,
 *  the bubbles' own height, and the sheet overlapping its bottom edge. */
const EXPLORE_PADDING: FramePadding = { topLeft: [48, 200], bottomRight: [48, 56] };

type LatLng = { lat: number; lng: number };

export default function AreaMapInner({
  places,
  near,
  highlightId,
  padding = EXPLORE_PADDING,
  embedded = false,
  focus,
  frame = "country",
}: {
  places: PlaceSummary[];
  near?: LatLng | null;
  highlightId?: string;
  focus?: MapFocus | null;
  padding?: FramePadding;
  /** A map set inside a scrolling page: on touch screens one finger scrolls
   *  the page rather than dragging the map (two fingers still pan and zoom). */
  embedded?: boolean;
  /** With nothing chosen: frame South Africa, or just the places given
   *  (Explore, filtered to one province). */
  frame?: "country" | "places";
}) {
  const router = useRouter();
  const pathname = usePathname();
  // Amounts count up the first time the map is seen; after that, pins are
  // drawn with their totals straight away.
  const [revealed, setRevealed] = useState(false);
  const focusName = focus?.name;
  const focusCents = focus?.raisedCents;
  const focusIcon = useMemo(
    () =>
      focusName
        ? bubbleIcon(
            focusCents === null || focusCents === undefined
              ? { name: focusName, text: "No circles yet" }
              : { name: focusName, cents: focusCents },
            true,
            prefersReducedMotion(),
            "mz-focus",
          )
        : null,
    [focusName, focusCents],
  );
  const icons = useMemo(
    () =>
      new Map(
        places.map((p) => [
          p.id,
          bubbleIcon({ cents: p.raisedCents }, p.id === highlightId, revealed),
        ]),
      ),
    [places, highlightId, revealed],
  );
  const initialCenter: [number, number] = near
    ? [near.lat, near.lng]
    : [-28.8, 24.7]; // roughly the centre of South Africa — the all-places default

  return (
    <MapContainer
      center={initialCenter}
      zoom={FRAME_MAX_ZOOM}
      minZoom={4}
      maxZoom={11}
      // Fractional zoom, so framing South Africa fills the map instead of
      // snapping out to a whole level that shows half the continent.
      zoomSnap={0.1}
      scrollWheelZoom={false}
      dragging={!(embedded && L.Browser.mobile)}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FrameMap places={places} near={near} focus={focus} padding={padding} frame={frame} />
      <QuietAttribution />
      <CountUpPins revealed={revealed} onRevealed={() => setRevealed(true)} focusId={focus?.id} />
      {near && (
        <Marker position={[near.lat, near.lng]} icon={ICON_ME} zIndexOffset={-1000} interactive={false} />
      )}
      {focus && focusIcon && (
        <Marker
          position={[focus.lat, focus.lng]}
          icon={focusIcon}
          zIndexOffset={1500}
          interactive={false}
        />
      )}
      {places.filter((p) => p.id !== focus?.id).map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={icons.get(p.id)}
          zIndexOffset={p.id === highlightId ? 1000 : 0}
          eventHandlers={{
            // A pin selects its place on whichever page the map is on.
            click: () => {
              const params = new URLSearchParams(window.location.search);
              params.set("place", p.id);
              params.delete("circle");
              router.push(`${pathname}?${params.toString()}`, { scroll: false });
            },
          }}
        >
          <Tooltip direction="top" offset={[0, 0]}>
            <strong>{p.name}</strong>
            <br />
            {p.circleCount} {p.circleCount === 1 ? "circle" : "circles"} ·{" "}
            {formatZAR(p.raisedCents, { compact: true })} raised
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}

/**
 * Frames the map: on a chosen place, on the viewer's own position in "near
 * me" mode, otherwise on South Africa (or, on Explore filtered to one
 * province, around that province's places).
 * Runs on load without animation and re-flies when the mode changes, so it
 * never fights the viewer's own panning.
 */
function FrameMap({
  places,
  near,
  focus,
  padding,
  frame,
}: {
  places: PlaceSummary[];
  near?: LatLng | null;
  focus?: MapFocus | null;
  padding: FramePadding;
  frame: "country" | "places";
}) {
  const map = useMap();
  const first = useRef(true);
  const key = focus
    ? `focus:${focus.id}`
    : near
      ? `near:${near.lat},${near.lng}`
      : `${frame}:${places.length}`;

  useEffect(() => {
    const animate = !first.current;
    first.current = false;
    if (focus) {
      if (animate) map.flyTo([focus.lat, focus.lng], NEAR_ME_ZOOM, { duration: 1.1 });
      else map.setView([focus.lat, focus.lng], NEAR_ME_ZOOM, { animate: false });
      return;
    }
    if (near) {
      if (animate) map.flyTo([near.lat, near.lng], NEAR_ME_ZOOM, { duration: 0.8 });
      else map.setView([near.lat, near.lng], NEAR_ME_ZOOM, { animate: false });
      return;
    }
    if (frame === "places" && places.length === 0) return;
    const bounds =
      frame === "country"
        ? SOUTH_AFRICA
        : L.latLngBounds(places.map((p) => [p.lat, p.lng] as [number, number]));
    const opts = {
      paddingTopLeft: padding.topLeft,
      paddingBottomRight: padding.bottomRight,
      maxZoom: FRAME_MAX_ZOOM,
    };
    if (animate) map.flyToBounds(bounds, { ...opts, duration: 0.8 });
    else map.fitBounds(bounds, { ...opts, animate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

/**
 * Counts the pins' amounts up from R0 the first time the map scrolls into
 * view, and a chosen place's tag each time one is picked after that.
 */
function CountUpPins({
  revealed,
  onRevealed,
  focusId,
}: {
  revealed: boolean;
  onRevealed: () => void;
  focusId?: string;
}) {
  const map = useMap();

  useEffect(() => {
    if (revealed) return;
    if (prefersReducedMotion()) {
      onRevealed();
      return;
    }
    const container = map.getContainer();
    let cancel: (() => void) | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          cancel = countUpIn(container, onRevealed);
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(container);
    return () => {
      observer.disconnect();
      cancel?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, revealed]);

  useEffect(() => {
    if (!revealed || !focusId) return;
    let cancel: (() => void) | undefined;
    // Wait a frame for the new tag's marker to be on the map.
    const frame = requestAnimationFrame(() => {
      const tag = map.getContainer().querySelector(".mz-focus");
      if (tag) cancel = countUpIn(tag);
    });
    return () => {
      cancelAnimationFrame(frame);
      cancel?.();
    };
  }, [map, revealed, focusId]);

  return null;
}

/** Drops Leaflet's own "Leaflet" self-credit from the attribution line —
 *  that part is just a courtesy, not required. The OpenStreetMap copyright
 *  stays: their free tiles are conditioned on keeping it reasonably visible,
 *  so it's only ever styled smaller (see `.mz-map .leaflet-control-attribution`
 *  in globals.css), never removed. */
function QuietAttribution() {
  const map = useMap();
  useEffect(() => {
    map.attributionControl.setPrefix(false);
  }, [map]);
  return null;
}
