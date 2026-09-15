"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Area } from "@mseezee/shared";
import { formatZAR } from "@mseezee/shared";
import { selectArea } from "@/lib/select-area";

/**
 * The actual Leaflet map — loaded only on the client via `next/dynamic` in
 * `AreaMap.tsx`, since Leaflet touches `window` at load time.
 *
 * Markers sit at each *area's* centroid, not a precise address — and the map
 * can't zoom in past township level (`maxZoom`), so "general area" is a real
 * constraint, not just a convention. Nothing here reads device location;
 * picking an area is still an explicit click, same as the old dropdown.
 */
export default function AreaMapInner({
  areas,
  current,
}: {
  areas: Area[];
  current: string;
}) {
  const router = useRouter();

  return (
    <MapContainer
      center={[-28.8, 24.7]}
      zoom={5}
      minZoom={5}
      maxZoom={11}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToAreas areas={areas} />
      {areas.map((a) => {
        const active = a.slug === current;
        return (
          <CircleMarker
            key={a.slug}
            center={[a.lat, a.lng]}
            radius={active ? 15 : 10}
            pathOptions={{
              color: active ? "var(--gold-line)" : "var(--forest)",
              fillColor: active ? "var(--gold-line)" : "var(--forest)",
              fillOpacity: active ? 0.55 : 0.3,
              weight: active ? 3 : 2,
            }}
            eventHandlers={{ click: () => selectArea(router, a.slug) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <strong>{a.name}</strong>
              <br />
              {a.activeCircleCount} circles ·{" "}
              {formatZAR(a.raisedThisMonthCents, { compact: true })} this month
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

/** Frames the map to fit every seeded area on first render. */
function FitToAreas({ areas }: { areas: Area[] }) {
  const map = useMap();
  useEffect(() => {
    if (areas.length === 0) return;
    const bounds: [number, number][] = areas.map((a) => [a.lat, a.lng]);
    map.fitBounds(bounds, { padding: [28, 28] });
    // Only on mount — re-fitting on every render would fight the user's own pan/zoom.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
