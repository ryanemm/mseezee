"use client";

import { useRouter } from "next/navigation";
import { PlaceSearch } from "./PlaceSearch";

/** Search on the home page and Explore: circles open directly; places open
 *  their page — including places with no circles, which say so and point to
 *  the nearest ones. */
export function ExplorePlaceSearch({ floating = false }: { floating?: boolean }) {
  const router = useRouter();
  return (
    <PlaceSearch
      variant={floating ? "float" : "pill"}
      showCircleCounts
      placeholder="Search a place or a circle"
      onSelect={(place) => router.push(`/places/${place.id}`)}
      onSelectCircle={(circle) => router.push(`/circles/${circle.slug}`)}
    />
  );
}
