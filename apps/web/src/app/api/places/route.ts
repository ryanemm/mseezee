import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { searchCircles, searchPlaces } from "@/lib/places";

export const runtime = "nodejs";

/** Public search over Stats SA places — plus matching circles when
 *  `?circles=1` (home and Explore; the create-circle location step only wants
 *  places). Everything returned is already public. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = params.get("q") ?? "";
  if (q.length > 80) {
    return NextResponse.json({ error: "Search is too long." }, { status: 400 });
  }
  const all = await api.listCircles({});
  const [places, circles] = await Promise.all([
    searchPlaces(q, all),
    params.get("circles") === "1" ? searchCircles(q, all) : [],
  ]);
  return NextResponse.json({ places, circles });
}
