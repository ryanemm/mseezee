"use client";

import { useRouter } from "next/navigation";
import { PlaceSearch } from "./PlaceSearch";

/** Explore's search: picking any place opens its page — including places with
 *  no circles, which say so and point to the nearest ones. */
export function ExplorePlaceSearch() {
  const router = useRouter();
  return (
    <PlaceSearch
      showCircleCounts
      onSelect={(place) => router.push(`/places/${place.id}`)}
    />
  );
}
