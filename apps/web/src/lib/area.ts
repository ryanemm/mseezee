import { cookies } from "next/headers";
import { DEFAULT_AREA_SLUG, findArea } from "@mseezee/shared";
import { AREA_COOKIE } from "./area-constants";

export { AREA_COOKIE };

/**
 * Resolve the viewer's area: an explicit `?area=` wins, then the saved cookie,
 * then the default. Location is always coarse and self-selected — we never ask
 * for device GPS to do this.
 */
export async function resolveAreaSlug(
  searchParamArea?: string | string[],
): Promise<string> {
  const fromParam = Array.isArray(searchParamArea)
    ? searchParamArea[0]
    : searchParamArea;
  if (fromParam && findArea(fromParam)) return fromParam;

  const store = await cookies();
  const fromCookie = store.get(AREA_COOKIE)?.value;
  if (fromCookie && findArea(fromCookie)) return fromCookie;

  return DEFAULT_AREA_SLUG;
}
