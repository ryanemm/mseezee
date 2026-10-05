import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/places";

export const runtime = "nodejs";

/** Public suburb/township search — used by Explore and the create-circle
 *  location step. Place names are public Stats SA data, so no sign-in. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.length > 80) {
    return NextResponse.json({ error: "Search is too long." }, { status: 400 });
  }
  const places = await searchPlaces(q);
  return NextResponse.json({ places });
}
