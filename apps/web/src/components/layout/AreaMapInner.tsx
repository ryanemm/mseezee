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
 * not a convention. Nothing here reads device location; choosing an area is
 * an explicit tap, same as the old dropdown.
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

const ICON_DEFAULT = pinIcon(false);
const ICON_ACTIVE = pinIcon(true);

/** How far around the chosen area still counts as "nearby" when framing the map. */
const NEIGHBOUR_KM = 150;
/** Never zoom tighter than this — township level, keeping it "general area". */
const FRAME_MAX_ZOOM = 9;

export default function AreaMapInner({
  areas,
  current,
}: {
  areas: Area[];
  current: string;
}) {
  const router = useRouter();
  const currentArea = areas.find((a) => a.slug === current) ?? areas[0];

  return (
    <MapContainer
      center={currentArea ? [currentArea.lat, currentArea.lng] : [-28.8, 24.7]}
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
      <FrameCurrent areas={areas} slug={current} />
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
 * Frames the chosen area together with its nearby neighbours — enough context to
 * see what's around you, tight enough that the pins don't pile on top of each
 * other. Runs on load (no animation) and whenever a pin or "near me" changes the
 * choice. Extra room at the top keeps the floating "Find circles near me"
 * button clear of the pins.
 */
function FrameCurrent({ areas, slug }: { areas: Area[]; slug: string }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    const here = areas.find((a) => a.slug === slug);
    if (!here) return;
    const nearby = areas.filter(
      (a) => distanceKm(here, a) <= NEIGHBOUR_KM,
    );
    const bounds = L.latLngBounds(nearby.map((a) => [a.lat, a.lng] as [number, number]));
    const opts = {
      paddingTopLeft: [32, 84] as [number, number],
      paddingBottomRight: [32, 36] as [number, number],
      maxZoom: FRAME_MAX_ZOOM,
    };
    if (first.current) {
      map.fitBounds(bounds, { ...opts, animate: false });
      first.current = false;
    } else {
      map.flyToBounds(bounds, { ...opts, duration: 0.8 });
    }
    // Keyed on the chosen area only — re-running on every render would fight the
    // user's own panning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);
  return null;
}
