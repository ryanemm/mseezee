import { AREA_COOKIE } from "./area-constants";

/** A minimal router shape — avoids importing next/navigation's router type
 *  just for this one call site. */
type Router = { push: (href: string) => void; refresh: () => void };

/** Sets the chosen area (cookie + `?area=`) and re-renders the page with it —
 *  the one thing both the map's marker clicks and "find near me" do. */
export function selectArea(router: Router, slug: string) {
  document.cookie = `${AREA_COOKIE}=${slug}; path=/; max-age=${60 * 60 * 24 * 365}`;
  router.push(`/?area=${slug}`);
  router.refresh();
}
