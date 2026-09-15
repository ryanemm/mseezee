import { NextResponse } from "next/server";
import { isCircleType } from "@mseezee/shared";
import { auth } from "@/auth";
import { createCircle } from "@/lib/liveCircles";

export const runtime = "nodejs";

interface Body {
  type?: string;
  title?: string;
  story?: string;
  beneficiaryName?: string;
  areaSlug?: string;
  areaSection?: string;
  locationPrecision?: string;
  goalCents?: number;
}

const PRECISIONS = new Set(["exact", "area", "hidden"]);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to start a circle." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;

  if (!body.type || !isCircleType(body.type)) {
    return NextResponse.json({ error: "Choose what you're creating." }, { status: 400 });
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Give the circle a title." }, { status: 400 });
  }
  if (!body.beneficiaryName?.trim()) {
    return NextResponse.json({ error: "Say who receives the funds." }, { status: 400 });
  }
  if (!body.areaSlug) {
    return NextResponse.json({ error: "Choose an area." }, { status: 400 });
  }
  if (!Number.isInteger(body.goalCents) || (body.goalCents ?? 0) < 1000) {
    return NextResponse.json({ error: "Set a goal of at least R10." }, { status: 400 });
  }
  const precision = PRECISIONS.has(body.locationPrecision ?? "")
    ? (body.locationPrecision as "exact" | "area" | "hidden")
    : "area";
  // Funerals never publish an exact address — see the create wizard's own copy.
  const safePrecision = body.type === "funeral" && precision === "exact" ? "area" : precision;

  const circle = await createCircle(session.user.id, {
    type: body.type,
    title: body.title.trim(),
    story: body.story?.trim() || "No story added yet.",
    beneficiaryName: body.beneficiaryName.trim(),
    areaSlug: body.areaSlug,
    areaSection: body.areaSection?.trim() || undefined,
    locationPrecision: safePrecision,
    goalCents: body.goalCents!,
  });

  if (!circle) {
    return NextResponse.json({ error: "That area isn't recognised." }, { status: 400 });
  }

  return NextResponse.json({ circle });
}
