/**
 * A minimal, plain Paystack charge — no subaccount, no split, no MseeZee app
 * involved. Useful for reactivating/exercising an account, independent of
 * anything else in this repo.
 *
 * Usage:
 *   PAYSTACK_SECRET_KEY=sk_live_xxx EMAIL=you@example.com \
 *     node scripts/paystack/test-charge.mjs
 *
 * Optional:
 *   AMOUNT_RAND=10        # defaults to 10 (R10)
 *
 * Prints a checkout URL — open it in a browser and pay with a real card.
 * Nothing is created or stored anywhere except on Paystack's side.
 */

const SECRET = process.env.PAYSTACK_SECRET_KEY;
const EMAIL = process.env.EMAIL;
const AMOUNT_RAND = Number(process.env.AMOUNT_RAND ?? "5");

if (!SECRET || !SECRET.startsWith("sk_")) {
  console.error("Set PAYSTACK_SECRET_KEY in the environment.");
  process.exit(1);
}
if (!EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL)) {
  console.error("Set EMAIL to a valid address, e.g. EMAIL=you@example.com");
  process.exit(1);
}
if (!Number.isFinite(AMOUNT_RAND) || AMOUNT_RAND <= 0) {
  console.error("AMOUNT_RAND must be a positive number.");
  process.exit(1);
}

const reference = `standalone_${Date.now()}`;

const res = await fetch("https://api.paystack.co/transaction/initialize", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${SECRET}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: EMAIL,
    amount: Math.round(AMOUNT_RAND * 100), // rand -> cents
    currency: "ZAR",
    reference,
  }),
});

const body = await res.json().catch(() => ({}));

if (!res.ok || body.status === false) {
  console.error(`✗ ${body.message ?? res.status}`);
  if (body.meta?.nextStep) console.error(`  → ${body.meta.nextStep}`);
  process.exit(1);
}

console.log(`→ Mode: ${SECRET.startsWith("sk_live_") ? "LIVE" : "test"}`);
console.log(`→ Reference: ${reference}\n`);
console.log("Open this URL and pay with a real card:\n");
console.log(`  ${body.data.authorization_url}\n`);
console.log(
  "After paying, you can check status with:\n" +
    `  PAYSTACK_SECRET_KEY=... node scripts/paystack/check-transaction.mjs ${reference}`,
);
