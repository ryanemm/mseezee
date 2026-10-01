import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isPaystackConfigured, listZarBanks } from "@/lib/paystack";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (!isPaystackConfigured()) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  try {
    const banks = await listZarBanks();
    return NextResponse.json({ banks });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load the bank list.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
