"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PlaceSearch } from "./PlaceSearch";

/** The id of the home page's search-and-map section, which a home search
 *  scrolls into view. */
export const HOME_MAP_ID = "home-map";

/**
 * Search on the home page and Explore.
 *
 * On home, choosing a place or a circle keeps you on the page: it scrolls
 * down to the map, which flies to that area and previews its circles
 * (`?place=`, plus `&circle=` to put a chosen circle first).
 *
 * On Explore, a place opens Explore's own view of that area; a circle opens
 * its page.
 */
export function ExplorePlaceSearch({
  mode,
  floating = false,
  trailing,
}: {
  mode: "home" | "explore";
  /** Over the map — a deeper shadow so it lifts off the tiles. */
  floating?: boolean;
  /** A control tucked into the right end of the bar, e.g. "near me". */
  trailing?: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function focusOnHome(placeId: string, circleSlug?: string) {
    document
      .getElementById(HOME_MAP_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    const params = new URLSearchParams(searchParams.toString());
    params.set("place", placeId);
    if (circleSlug) params.set("circle", circleSlug);
    else params.delete("circle");
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  return (
    <PlaceSearch
      variant={floating ? "float" : "bar"}
      trailing={trailing}
      showCircleCounts
      placeholder="Search a place or a circle"
      onSelect={(place) =>
        mode === "home" ? focusOnHome(place.id) : router.push(`/explore?place=${place.id}`)
      }
      onSelectCircle={(circle) =>
        mode === "home"
          ? focusOnHome(circle.placeId, circle.slug)
          : router.push(`/circles/${circle.slug}`)
      }
    />
  );
}
