"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { PlaceSummary } from "@mseezee/shared";
import { formatZAR } from "@mseezee/shared";

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

/** An amount bubble ("R9.8k") with a tail, drawn in HTML so it sizes to its
 *  text — see `.mz-bubble` in globals.css. The marker element itself is 0×0
 *  at the point and the bubble hangs above it. */
function bubbleIcon(label: string, hot: boolean): L.DivIcon {
  return L.divIcon({
    className: "mz-pin",
    html: `<div class="mz-bubble${hot ? " mz-bubble-hot" : ""}">${label}</div>`,
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

/** Never zoom tighter than this — township level, keeping it "general area". */
const FRAME_MAX_ZOOM = 9;
/** Zoom used to frame the viewer's own position in "find near me" mode. */
const NEAR_ME_ZOOM = 9;

type LatLng = { lat: number; lng: number };

export default function AreaMapInner({
  places,
  near,
  highlightId,
}: {
  places: PlaceSummary[];
  near?: LatLng | null;
  highlightId?: string;
}) {
  const router = useRouter();
  const icons = useMemo(
    () =>
      new Map(
        places.map((p) => [
          p.id,
          bubbleIcon(formatZAR(p.raisedCents, { compact: true }), p.id === highlightId),
        ]),
      ),
    [places, highlightId],
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
      scrollWheelZoom={false}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FrameMap places={places} near={near} />
      <QuietAttribution />
      {near && (
        <Marker position={[near.lat, near.lng]} icon={ICON_ME} zIndexOffset={-1000} interactive={false} />
      )}
      {places.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={icons.get(p.id)}
          zIndexOffset={p.id === highlightId ? 1000 : 0}
          eventHandlers={{ click: () => router.push(`/places/${p.id}`) }}
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
 * Frames the map: on the viewer's own position in "near me" mode, otherwise
 * around every place that has circles (or the whole country if none do yet).
 * Runs on load without animation and re-flies when the mode changes, so it
 * never fights the viewer's own panning.
 */
function FrameMap({ places, near }: { places: PlaceSummary[]; near?: LatLng | null }) {
  const map = useMap();
  const first = useRef(true);
  const key = near ? `near:${near.lat},${near.lng}` : `all:${places.length}`;

  useEffect(() => {
    const animate = !first.current;
    first.current = false;
    if (near) {
      if (animate) map.flyTo([near.lat, near.lng], NEAR_ME_ZOOM, { duration: 0.8 });
      else map.setView([near.lat, near.lng], NEAR_ME_ZOOM, { animate: false });
      return;
    }
    if (places.length === 0) return;
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng] as [number, number]));
    const opts = {
      // Clear of the search bar and pills laid over the top of the map, the
      // bubbles' own height, and the sheet overlapping its bottom edge.
      paddingTopLeft: [48, 200] as [number, number],
      paddingBottomRight: [48, 56] as [number, number],
      maxZoom: FRAME_MAX_ZOOM,
    };
    if (animate) map.flyToBounds(bounds, { ...opts, duration: 0.8 });
    else map.fitBounds(bounds, { ...opts, animate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
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
