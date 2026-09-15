import { NextResponse } from "next/server";
import { requestOtp } from "@/lib/otp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { phone?: string };
  const phone = String(body.phone ?? "").trim();
  if (!phone) {
    return NextResponse.json({ error: "Enter a cellphone number." }, { status: 400 });
  }

  const result = await requestOtp(phone);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
