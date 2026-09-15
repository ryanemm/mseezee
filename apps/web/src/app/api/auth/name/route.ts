import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/** Sets the signed-in user's display name — used right after a phone sign-up,
 *  where there's no other point in the flow that collects one. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { name?: string };
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Enter a name." }, { status: 400 });
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { name } });
  return NextResponse.json({ ok: true });
}
