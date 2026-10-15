"use client";

import { useRouter } from "next/navigation";
import { PlaceSearch } from "./PlaceSearch";

/** Search on the home page and Explore: circles open directly; places open
 *  their page — including places with no circles, which say so and point to
 *  the nearest ones. */
export function ExplorePlaceSearch({
  floating = false,
  trailing,
}: {
  /** Over the map — a deeper shadow so it lifts off the tiles. */
  floating?: boolean;
  /** A control tucked into the right end of the bar, e.g. "near me". */
  trailing?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <PlaceSearch
      variant={floating ? "float" : "bar"}
      trailing={trailing}
      showCircleCounts
      placeholder="Search a place or a circle"
      onSelect={(place) => router.push(`/places/${place.id}`)}
      onSelectCircle={(circle) => router.push(`/circles/${circle.slug}`)}
    />
  );
}
