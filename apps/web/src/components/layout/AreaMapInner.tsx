"use client";

import { useEffect, useRef } from "react";
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
 * One pin per place that has circles, at the place's centre point (from Stats
 * SA), never a household. The map can't zoom in past township level
 * (`maxZoom`) — "general area" is a hard limit, not a convention. Nothing here reads device location itself — `near`
 * arrives already resolved from a one-off "find circles near me" tap
 * elsewhere on the page.
 */

const FOREST = "#1f4a34";

/** A teardrop pin drawn inline — no image assets, so nothing to bundle or 404. */
function pinIcon(): L.DivIcon {
  const w = 32;
  const h = 40;
  return L.divIcon({
    className: "mz-pin",
    html: `<svg width="${w}" height="${h}" viewBox="0 0 32 40" aria-hidden="true">
      <path d="M16 38.5S3.2 24.6 3.2 15.6a12.8 12.8 0 1 1 25.6 0C28.8 24.6 16 38.5 16 38.5z" fill="${FOREST}" stroke="#fffdf7" stroke-width="2"/>
      <circle cx="16" cy="15.6" r="4.6" fill="#fffdf7"/>
    </svg>`,
    iconSize: [w, h],
    iconAnchor: [w / 2, h - 1],
    tooltipAnchor: [0, -h + 6],
  });
}

/** The viewer's own position, once "find circles near me" resolves it — a
 *  plain dot, deliberately not another teardrop pin, so it never reads as
 *  "a circle is here." */
function meIcon(): L.DivIcon {
  return L.divIcon({
    className: "mz-pin",
    html: `<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="#2f6c4a" fill-opacity="0.18"/>
      <circle cx="11" cy="11" r="5.5" fill="#2f6c4a" stroke="#fffdf7" stroke-width="2.5"/>
    </svg>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

const ICON_DEFAULT = pinIcon();
const ICON_ME = meIcon();

/** Never zoom tighter than this — township level, keeping it "general area". */
const FRAME_MAX_ZOOM = 9;
/** Zoom used to frame the viewer's own position in "find near me" mode. */
const NEAR_ME_ZOOM = 9;

type LatLng = { lat: number; lng: number };

export default function AreaMapInner({
  places,
  near,
}: {
  places: PlaceSummary[];
  near?: LatLng | null;
}) {
  const router = useRouter();
  const initialCenter: [number, number] = near
    ? [near.lat, near.lng]
    : [-28.8, 24.7]; // roughly the centre of South Africa — the all-places default

  return (
    <MapContainer
      center={initialCenter}
      zoom={FRAME_MAX_ZOOM}
      minZoom={5}
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
        <Marker position={[near.lat, near.lng]} icon={ICON_ME} zIndexOffset={2000} interactive={false} />
      )}
      {places.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={ICON_DEFAULT}
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
      paddingTopLeft: [32, 48] as [number, number],
      paddingBottomRight: [32, 36] as [number, number],
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
