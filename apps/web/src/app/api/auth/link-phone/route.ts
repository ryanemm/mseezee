import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";
import { toE164ZA } from "@/lib/smsportal";

export const runtime = "nodejs";

/**
 * Attach a verified phone number to the *current* signed-in account. This is
 * the only way a phone number joins an existing account — sign-in itself
 * never merges accounts on its own, since matching on phone/email alone
 * without a session already proving who you are is a takeover vector.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    phone?: string;
    code?: string;
  };
  const phoneRaw = String(body.phone ?? "");
  const code = String(body.code ?? "");
  const phone = toE164ZA(phoneRaw);
  if (!phone || !code) {
    return NextResponse.json({ error: "Enter the number and the code." }, { status: 400 });
  }

  const result = await verifyOtp(phoneRaw, code);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing && existing.id !== session.user.id) {
    return NextResponse.json(
      { error: "That number is already linked to a different account." },
      { status: 409 },
    );
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { phone, phoneVerified: new Date() },
    });
  } catch {
    // Unique-constraint race: someone else claimed it between the check above
    // and this write.
    return NextResponse.json(
      { error: "That number is already linked to a different account." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, phone });
}
