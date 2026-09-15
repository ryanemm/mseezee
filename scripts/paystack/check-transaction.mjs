/**
 * Look up a transaction directly from Paystack and print where the money
 * actually went — the reliable way to confirm a subaccount split, instead of
 * hunting for the right dashboard page.
 *
 * Usage:
 *   PAYSTACK_SECRET_KEY=sk_live_xxx node scripts/paystack/check-transaction.mjs mz_abc123
 *
 * The reference is printed after `initialize`, shown in the callback page URL
 * (?reference=...), and visible in Prisma Studio's Contribution table.
 */

const SECRET = process.env.PAYSTACK_SECRET_KEY;
const reference = process.argv[2];

if (!SECRET || !SECRET.startsWith("sk_")) {
  console.error("Set PAYSTACK_SECRET_KEY in the environment.");
  process.exit(1);
}
if (!reference) {
  console.error("Usage: PAYSTACK_SECRET_KEY=sk_... node scripts/paystack/check-transaction.mjs <reference>");
  process.exit(1);
}

const API = "https://api.paystack.co";
const headers = { Authorization: `Bearer ${SECRET}` };

async function call(path) {
  const res = await fetch(`${API}${path}`, { headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.status === false) {
    throw new Error(`GET ${path} → ${res.status} ${body.message ?? ""}`);
  }
  return body.data;
}

const rand = (kobo) => `R${(kobo / 100).toFixed(2)}`;

async function main() {
  console.log(`→ Mode: ${SECRET.startsWith("sk_live_") ? "LIVE" : "test"}\n`);

  const txn = await call(`/transaction/verify/${encodeURIComponent(reference)}`);

  console.log(`Transaction ${txn.id}`);
  console.log(`  status        : ${txn.status}`);
  console.log(`  amount charged: ${rand(txn.amount)} (${txn.currency})`);
  console.log(`  channel       : ${txn.channel ?? "—"}`);
  console.log(`  paid at       : ${txn.paid_at ?? "—"}`);
  console.log(`  paystack fees : ${txn.fees != null ? rand(txn.fees) : "—"}`);

  if (txn.subaccount?.subaccount_code) {
    console.log(`\nRouted to subaccount ${txn.subaccount.subaccount_code}`);
    console.log(`  business name : ${txn.subaccount.business_name ?? "—"}`);
    console.log(`  settlement bk : ${txn.subaccount.settlement_bank ?? "—"}`);
    if (txn.fees_split) {
      console.log(`  fee bearer    : ${txn.fees_split.paystack != null ? "see breakdown below" : "—"}`);
      console.log(`  split detail  : ${JSON.stringify(txn.fees_split)}`);
    }
    // subaccount.amount is what that subaccount is credited for this transaction.
    if (txn.subaccount.amount != null) {
      console.log(`  credited      : ${rand(txn.subaccount.amount)}`);
    }

    console.log(`\n→ Fetching subaccount detail…`);
    const sub = await call(`/subaccount/${txn.subaccount.subaccount_code}`);
    console.log(`  account name  : ${sub.account_name ?? "(unresolved)"}`);
    console.log(`  account no.   : ${sub.account_number}`);
    console.log(`  settlement bk : ${sub.settlement_bank}`);
  } else {
    console.log(`\nNo subaccount on this transaction — it settled entirely to the main account.`);
  }

  console.log(
    `\nReal settlement to a bank account lands on Paystack's normal schedule\n` +
      `(commonly next business day for live ZAR) — a "success" status here does\n` +
      `not mean the bank balance has updated yet.`,
  );
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
