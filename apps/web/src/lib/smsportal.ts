/**
 * SMSPortal REST API client — used to send phone-verification codes.
 * https://docs.smsportal.com/reference
 *
 * Two env vars required: SMSPORTAL_CLIENT_ID, SMSPORTAL_API_SECRET.
 * SMSPORTAL_TEST_MODE=true sends in test mode (no real SMS, no cost) — useful
 * while developing.
 */

const BASE = "https://rest.smsportal.com";

interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}

let cached: TokenCache | null = null;

export function isSmsPortalConfigured(): boolean {
  return Boolean(process.env.SMSPORTAL_CLIENT_ID && process.env.SMSPORTAL_API_SECRET);
}

function credentials(): string {
  const id = process.env.SMSPORTAL_CLIENT_ID;
  const secret = process.env.SMSPORTAL_API_SECRET;
  if (!id || !secret) throw new Error("SMSPORTAL_CLIENT_ID / SMSPORTAL_API_SECRET not set");
  return Buffer.from(`${id}:${secret}`).toString("base64");
}

async function getToken(): Promise<string> {
  const now = Date.now();
  // Refresh a couple of minutes early so a request never races an expiry.
  if (cached && cached.expiresAt - now > 2 * 60 * 1000) {
    return cached.token;
  }

  const res = await fetch(`${BASE}/Authentication`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials()}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`SMSPortal auth failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { token: string; expiresInMinutes: number };
  cached = { token: body.token, expiresAt: now + body.expiresInMinutes * 60 * 1000 };
  return body.token;
}

/**
 * Normalise a South African number to E.164 (+27...) for SMSPortal's
 * `destination` field. Accepts 0821234567, 27821234567, or +27821234567.
 */
export function toE164ZA(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("27") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+27${digits.slice(1)}`;
  if (raw.startsWith("+27") && digits.length === 11) return `+${digits}`;
  return null;
}

export async function sendSms(destination: string, content: string): Promise<void> {
  const token = await getToken();
  const testMode = process.env.SMSPORTAL_TEST_MODE === "true";

  const res = await fetch(`${BASE}/v3/BulkMessages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ destination, content }],
      sendOptions: { testMode },
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok || (body.errors && body.errors.length > 0)) {
    throw new Error(
      `SMSPortal send failed: ${res.status} ${JSON.stringify(body.errors ?? body)}`,
    );
  }
}
