import type { Circle, CirclePlace, PlaceSummary } from "@mseezee/shared";
import type { Place as DbPlace } from "@/generated/prisma";
import { prisma } from "@/lib/db";
import { api } from "@/lib/api";

/**
 * Stats SA places (see the `Place` model) and the circles in them. Circle
 * counts and totals are always worked out from the circles themselves — the
 * same merged list the home page uses — so example circles count too, and
 * nothing is ever a seeded number.
 */

export interface PlaceSearchResult {
  id: string;
  kind: "main" | "sub";
  name: string;
  mainPlaceName: string;
  municipality: string;
  province: string;
  circleCount: number;
}

function toCirclePlace(row: DbPlace): CirclePlace {
  return {
    id: row.id,
    name: row.name,
    mainPlaceId: row.mainPlaceId,
    mainPlaceName: row.mainPlaceName,
    municipality: row.municipality,
    province: row.province,
    lat: row.lat,
    lng: row.lng,
  };
}

/** Circles in a place — for a main place, anything anywhere inside it. */
export function circlesIn(circles: Circle[], placeId: string): Circle[] {
  return circles.filter((c) => c.area.id === placeId || c.area.mainPlaceId === placeId);
}

export async function getPlace(id: string): Promise<CirclePlace | null> {
  const row = await prisma.place.findUnique({ where: { id } });
  return row ? toCirclePlace(row) : null;
}

/**
 * Suburb/township search. Every word typed has to appear somewhere in the
 * place's name, main place or municipality ("orlando soweto" works). Ranked
 * so exact and starts-with name matches come first, then main places ahead of
 * the sub places inside them.
 */
export async function searchPlaces(query: string, limit = 12): Promise<PlaceSearchResult[]> {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean).slice(0, 5);
  if (words.length === 0 || words.join("").length < 2) return [];

  const rows = await prisma.place.findMany({
    where: { AND: words.map((w) => ({ searchText: { contains: w } })) },
    take: 300,
  });

  const q = words.join(" ");
  const score = (row: DbPlace) => {
    const name = row.name.toLowerCase();
    let s = 0;
    if (name === q) s += 100;
    else if (name.startsWith(q)) s += 60;
    else if (name.includes(q)) s += 30;
    if (row.kind === "main") s += 10;
    return s;
  };
  const ranked = rows
    .sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name))
    .slice(0, limit);

  const all = await api.listCircles({});
  return ranked.map((row) => ({
    id: row.id,
    kind: row.kind as "main" | "sub",
    name: row.name,
    mainPlaceName: row.mainPlaceName,
    municipality: row.municipality,
    province: row.province,
    circleCount: circlesIn(all, row.id).length,
  }));
}

/** Every place that currently has at least one circle, busiest first. Each
 *  circle counts once, under the place it shows publicly. */
export function summarisePlaces(circles: Circle[]): PlaceSummary[] {
  const byPlace = new Map<string, PlaceSummary>();
  for (const c of circles) {
    const existing = byPlace.get(c.area.id);
    if (existing) {
      existing.circleCount += 1;
      existing.raisedCents += c.raisedCents;
    } else {
      byPlace.set(c.area.id, { ...c.area, circleCount: 1, raisedCents: c.raisedCents });
    }
  }
  return [...byPlace.values()].sort(
    (a, b) => b.circleCount - a.circleCount || b.raisedCents - a.raisedCents,
  );
}
