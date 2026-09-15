/**
 * Look up South African bank codes (the `settlement_bank` value a subaccount
 * needs). Read-only — safe to run with a test key even when you're about to
 * create a live subaccount.
 *
 * Usage:
 *   PAYSTACK_SECRET_KEY=sk_test_xxx node scripts/paystack/list-banks.mjs
 *   PAYSTACK_SECRET_KEY=sk_test_xxx node scripts/paystack/list-banks.mjs capitec
 */

const SECRET = process.env.PAYSTACK_SECRET_KEY;
if (!SECRET || !SECRET.startsWith("sk_")) {
  console.error("Set PAYSTACK_SECRET_KEY in the environment (test key is fine).");
  process.exit(1);
}

const search = process.argv[2]?.toLowerCase();

const res = await fetch("https://api.paystack.co/bank?currency=ZAR&perPage=100", {
  headers: { Authorization: `Bearer ${SECRET}` },
});
const body = await res.json();
if (!res.ok || body.status === false) {
  console.error(`✗ ${body.message ?? res.status}`);
  process.exit(1);
}

const banks = body.data
  .filter((b) => !search || b.name.toLowerCase().includes(search))
  .sort((a, b) => a.name.localeCompare(b.name));

if (banks.length === 0) {
  console.log(`No ZAR bank matched "${process.argv[2]}". Try fewer letters.`);
} else {
  for (const b of banks) {
    console.log(`${String(b.code).padEnd(10)} ${b.name}`);
  }
}
