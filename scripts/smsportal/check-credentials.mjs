/**
 * Validate SMSPortal API credentials — auth only, no SMS sent, no cost.
 *
 * Usage:
 *   SMSPORTAL_CLIENT_ID=xxx SMSPORTAL_API_SECRET=xxx \
 *     node scripts/smsportal/check-credentials.mjs
 */

const clientId = process.env.SMSPORTAL_CLIENT_ID;
const secret = process.env.SMSPORTAL_API_SECRET;

if (!clientId || !secret) {
  console.error("Set SMSPORTAL_CLIENT_ID and SMSPORTAL_API_SECRET in the environment.");
  process.exit(1);
}

const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

const res = await fetch("https://rest.smsportal.com/Authentication", {
  method: "POST",
  headers: { Authorization: `Basic ${auth}` },
});
const body = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error(`✗ Auth failed: ${res.status} ${JSON.stringify(body)}`);
  process.exit(1);
}

console.log("✓ Credentials are valid.");
console.log(`  token schema     : ${body.schema}`);
console.log(`  expires in       : ${body.expiresInMinutes} minutes`);
console.log(`\nNo SMS was sent and nothing was charged — this only requested a token.`);
