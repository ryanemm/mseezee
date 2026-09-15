import type { Area } from "./types";

/**
 * A small seed of South African areas for the prototype. Real deployment seeds
 * this from Municipal Demarcation Board ward boundaries plus StatsSA / OSM
 * suburb names. Centroids are approximate and used only for distance sorting
 * and the area map — never for locating a household.
 */
export const AREAS: Area[] = [
  {
    id: "area_soweto",
    slug: "soweto",
    name: "Soweto",
    kind: "township",
    municipality: "City of Johannesburg",
    province: "Gauteng",
    lat: -26.2678,
    lng: 27.8586,
    activeCircleCount: 34,
    raisedThisMonthCents: 4_812_000,
    contributorCount: 1290,
  },
  {
    id: "area_alexandra",
    slug: "alexandra",
    name: "Alexandra",
    kind: "township",
    municipality: "City of Johannesburg",
    province: "Gauteng",
    lat: -26.1039,
    lng: 28.0968,
    activeCircleCount: 19,
    raisedThisMonthCents: 2_140_500,
    contributorCount: 604,
  },
  {
    id: "area_tembisa",
    slug: "tembisa",
    name: "Tembisa",
    kind: "township",
    municipality: "City of Ekurhuleni",
    province: "Gauteng",
    lat: -25.9964,
    lng: 28.2264,
    activeCircleCount: 22,
    raisedThisMonthCents: 3_007_225,
    contributorCount: 733,
  },
  {
    id: "area_mamelodi",
    slug: "mamelodi",
    name: "Mamelodi",
    kind: "township",
    municipality: "City of Tshwane",
    province: "Gauteng",
    lat: -25.7069,
    lng: 28.3903,
    activeCircleCount: 16,
    raisedThisMonthCents: 1_889_000,
    contributorCount: 512,
  },
  {
    id: "area_khayelitsha",
    slug: "khayelitsha",
    name: "Khayelitsha",
    kind: "township",
    municipality: "City of Cape Town",
    province: "Western Cape",
    lat: -34.0403,
    lng: 18.6777,
    activeCircleCount: 28,
    raisedThisMonthCents: 3_654_000,
    contributorCount: 981,
  },
  {
    id: "area_gugulethu",
    slug: "gugulethu",
    name: "Gugulethu",
    kind: "township",
    municipality: "City of Cape Town",
    province: "Western Cape",
    lat: -33.9803,
    lng: 18.5722,
    activeCircleCount: 12,
    raisedThisMonthCents: 1_204_775,
    contributorCount: 388,
  },
  {
    id: "area_mdantsane",
    slug: "mdantsane",
    name: "Mdantsane",
    kind: "township",
    municipality: "Buffalo City",
    province: "Eastern Cape",
    lat: -32.9445,
    lng: 27.7688,
    activeCircleCount: 14,
    raisedThisMonthCents: 1_431_000,
    contributorCount: 402,
  },
  {
    id: "area_umlazi",
    slug: "umlazi",
    name: "Umlazi",
    kind: "township",
    municipality: "eThekwini",
    province: "KwaZulu-Natal",
    lat: -29.9558,
    lng: 30.8823,
    activeCircleCount: 25,
    raisedThisMonthCents: 3_298_500,
    contributorCount: 845,
  },
  {
    id: "area_kwamashu",
    slug: "kwamashu",
    name: "KwaMashu",
    kind: "township",
    municipality: "eThekwini",
    province: "KwaZulu-Natal",
    lat: -29.7405,
    lng: 30.9762,
    activeCircleCount: 17,
    raisedThisMonthCents: 2_010_000,
    contributorCount: 559,
  },
  {
    id: "area_sandton",
    slug: "sandton",
    name: "Sandton",
    kind: "suburb",
    municipality: "City of Johannesburg",
    province: "Gauteng",
    lat: -26.1076,
    lng: 28.0567,
    activeCircleCount: 6,
    raisedThisMonthCents: 5_920_000,
    contributorCount: 210,
  },
];

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two coarse centroids, in km. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(h)));
}

export function findArea(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug);
}

export const DEFAULT_AREA_SLUG = "soweto";
