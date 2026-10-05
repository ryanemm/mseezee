import type { CirclePlace } from "./types";

/**
 * Places come from Stats SA's Census 2011 geography, loaded into the `Place`
 * table in Postgres (see scripts/places/build_statssa_places.py). The handful
 * defined here are the main places the example circles sit in, plus the map
 * from the ten fixed "areas" the app used before places existed, so old
 * `/areas/<slug>` links can redirect.
 *
 * Place data: Statistics South Africa, Census 2011.
 */
function mainPlace(
  id: string,
  name: string,
  municipality: string,
  province: string,
  lat: number,
  lng: number,
): CirclePlace {
  return { id, name, mainPlaceId: id, mainPlaceName: name, municipality, province, lat, lng };
}

export const LEGACY_AREA_PLACES: Record<string, CirclePlace> = {
  soweto: mainPlace("MP798030", "Soweto", "City of Johannesburg", "Gauteng", -26.2434, 27.8414),
  alexandra: mainPlace("MP798027", "Alexandra", "City of Johannesburg", "Gauteng", -26.1048, 28.1008),
  sandton: mainPlace("MP798013", "Sandton", "City of Johannesburg", "Gauteng", -26.0601, 28.0501),
  tembisa: mainPlace("MP797006", "Tembisa", "Ekurhuleni", "Gauteng", -26.0106, 28.2219),
  mamelodi: mainPlace("MP799045", "Mamelodi", "City of Tshwane", "Gauteng", -25.7159, 28.3932),
  khayelitsha: mainPlace("MP199043", "Khayelitsha", "City of Cape Town", "Western Cape", -34.0413, 18.6722),
  gugulethu: mainPlace("MP199034", "Gugulethu", "City of Cape Town", "Western Cape", -33.9855, 18.5767),
  mdantsane: mainPlace("MP260088", "Mdantsane", "Buffalo City", "Eastern Cape", -32.9437, 27.7305),
  umlazi: mainPlace("MP599167", "Umlazi", "Ethekwini", "KwaZulu-Natal", -29.9662, 30.8875),
  kwamashu: mainPlace("MP599055", "KwaMashu", "Ethekwini", "KwaZulu-Natal", -29.7416, 30.9902),
};

/** How a place is labelled wherever there's room for context:
 *  "Orlando West, Soweto · City of Johannesburg". */
export function placeLabel(place: Pick<CirclePlace, "name" | "mainPlaceName" | "municipality">): string {
  const where = place.name === place.mainPlaceName ? place.name : `${place.name}, ${place.mainPlaceName}`;
  return `${where} · ${place.municipality}`;
}

export const PLACE_DATA_CREDIT = "Place data: Statistics South Africa, Census 2011";

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two coarse centre points, in km. */
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
