"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Area } from "@mseezee/shared";
import { distanceKm, formatZAR } from "@mseezee/shared";
import { selectArea } from "@/lib/select-area";

/**
 * The actual Leaflet map — loaded only on the client via `next/dynamic` in
 * `AreaMap.tsx`, since Leaflet touches `window` at load time.
 *
 * Pins sit at each *area's* centroid, never a household, and the map can't
 * zoom in past township level (`maxZoom`) — "general area" is a hard limit,
 * not a convention. Nothing here reads device location itself — `near`
 * arrives already resolved from a one-off "find circles near me" tap
 * elsewhere on the page.
 */

const FOREST = "#1f4a34";
const GOLD = "#c8a24c";

/** A teardrop pin drawn inline — no image assets, so nothing to bundle or 404. */
function pinIcon(active: boolean): L.DivIcon {
  const w = active ? 40 : 32;
  const h = Math.round(w * 1.25);
  const fill = active ? GOLD : FOREST;
  return L.divIcon({
    className: "mz-pin",
    html: `<svg width="${w}" height="${h}" viewBox="0 0 32 40" aria-hidden="true">
      <path d="M16 38.5S3.2 24.6 3.2 15.6a12.8 12.8 0 1 1 25.6 0C28.8 24.6 16 38.5 16 38.5z" fill="${fill}" stroke="#fffdf7" stroke-width="2"/>
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

const ICON_DEFAULT = pinIcon(false);
const ICON_ACTIVE = pinIcon(true);
const ICON_ME = meIcon();

/** How far around the chosen area still counts as "nearby" when framing the map. */
const NEIGHBOUR_KM = 150;
/** Never zoom tighter than this — township level, keeping it "general area". */
const FRAME_MAX_ZOOM = 9;
/** Zoom used to frame the viewer's own position in "find near me" mode. */
const NEAR_ME_ZOOM = 9;

type LatLng = { lat: number; lng: number };

export default function AreaMapInner({
  areas,
  current,
  near,
}: {
  areas: Area[];
  current?: string;
  near?: LatLng | null;
}) {
  const router = useRouter();
  const currentArea = areas.find((a) => a.slug === current);
  const initialCenter: [number, number] = near
    ? [near.lat, near.lng]
    : currentArea
      ? [currentArea.lat, currentArea.lng]
      : [-28.8, 24.7]; // roughly the centre of South Africa — the all-areas default

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
      <FrameMap areas={areas} current={current} near={near} />
      <QuietAttribution />
      {near && (
        <Marker position={[near.lat, near.lng]} icon={ICON_ME} zIndexOffset={2000} interactive={false} />
      )}
      {areas.map((a) => {
        const active = a.slug === current;
        return (
          <Marker
            key={a.slug}
            position={[a.lat, a.lng]}
            icon={active ? ICON_ACTIVE : ICON_DEFAULT}
            zIndexOffset={active ? 1000 : 0}
            eventHandlers={{ click: () => selectArea(router, a.slug) }}
          >
            <Tooltip direction="top" offset={[0, 0]}>
              <strong>{a.name}</strong>
              <br />
              {a.activeCircleCount} circles ·{" "}
              {formatZAR(a.raisedThisMonthCents, { compact: true })} this month
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

/**
 * Frames the map to match whichever mode the home page is in:
 *  - `near` set: centres on the viewer's own position.
 *  - `current` set: frames that area together with its nearby neighbours,
 *    the same "enough context, not too tight" behaviour as before.
 *  - neither: frames every area, so the national default view isn't left
 *    zoomed in on an arbitrary single pin.
 * Runs on load (no animation) and re-flies (animated) whenever the mode
 * changes. Extra room at the top keeps the floating "Find circles near me"
 * button clear of the pins.
 */
function FrameMap({
  areas,
  current,
  near,
}: {
  areas: Area[];
  current?: string;
  near?: LatLng | null;
}) {
  const map = useMap();
  const first = useRef(true);
  const key = near ? `near:${near.lat},${near.lng}` : (current ?? "all");

  useEffect(() => {
    const opts = {
      paddingTopLeft: [32, 84] as [number, number],
      paddingBottomRight: [32, 36] as [number, number],
      maxZoom: FRAME_MAX_ZOOM,
    };

    if (near) {
      if (first.current) {
        map.setView([near.lat, near.lng], NEAR_ME_ZOOM, { animate: false });
      } else {
        map.flyTo([near.lat, near.lng], NEAR_ME_ZOOM, { duration: 0.8 });
      }
      first.current = false;
      return;
    }

    const here = current ? areas.find((a) => a.slug === current) : undefined;
    const scope = here
      ? areas.filter((a) => distanceKm(here, a) <= NEIGHBOUR_KM)
      : areas; // no area chosen — frame everything
    if (scope.length === 0) return;
    const bounds = L.latLngBounds(scope.map((a) => [a.lat, a.lng] as [number, number]));

    if (first.current) {
      map.fitBounds(bounds, { ...opts, animate: false });
      first.current = false;
    } else {
      map.flyToBounds(bounds, { ...opts, duration: 0.8 });
    }
    // Keyed on the resolved mode only — re-running on every render would fight
    // the viewer's own panning.
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
