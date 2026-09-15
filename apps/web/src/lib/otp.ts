import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { isSmsPortalConfigured, sendSms, toE164ZA } from "@/lib/smsportal";

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 30;

type Result = { ok: true } | { ok: false; error: string };

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Generate a code, store it hashed, and send it via SMSPortal. */
export async function requestOtp(rawPhone: string): Promise<Result> {
  const phone = toE164ZA(rawPhone);
  if (!phone) {
    return { ok: false, error: "Enter a valid South African cellphone number." };
  }

  const recent = await prisma.phoneOtp.findFirst({
    where: {
      phone,
      createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    return { ok: false, error: "Wait a moment before requesting another code." };
  }

  const code = generateCode();
  const codeHash = await hashPassword(code);
  await prisma.phoneOtp.create({
    data: {
      phone,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });

  const message = `${code} is your MseeZee verification code. It expires in ${OTP_TTL_MINUTES} minutes.`;

  if (isSmsPortalConfigured()) {
    await sendSms(phone, message);
  } else {
    // Dev fallback so the flow is testable before SMSPortal credentials exist.
    console.warn(`[dev] SMSPortal not configured — OTP for ${phone}: ${code}`);
  }

  return { ok: true };
}

/** Check a submitted code against the latest live OTP for that phone. */
export async function verifyOtp(rawPhone: string, code: string): Promise<Result> {
  const phone = toE164ZA(rawPhone);
  if (!phone || !code) return { ok: false, error: "Invalid phone number or code." };

  const otp = await prisma.phoneOtp.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return { ok: false, error: "That code has expired. Request a new one." };
  if (otp.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "Too many attempts. Request a new code." };
  }

  const valid = await verifyPassword(code, otp.codeHash);
  if (!valid) {
    await prisma.phoneOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "Incorrect code." };
  }

  await prisma.phoneOtp.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });
  return { ok: true };
}
