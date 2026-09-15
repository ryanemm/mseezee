/**
 * Create a Paystack subaccount — stands in for a partner org / test recipient
 * receiving the settled split of a transaction.
 *
 * Test mode (default):
 *   PAYSTACK_SECRET_KEY=sk_test_xxx node scripts/paystack/create-subaccount.mjs
 *
 * Live mode — real money, real bank account. Requires an explicit opt-in and
 * your actual bank details (no dummy defaults are allowed here on purpose):
 *   ALLOW_LIVE=yes \
 *   PAYSTACK_SECRET_KEY=sk_live_xxx \
 *   BANK_CODE=632005 ACCOUNT_NUMBER=your_real_account_number \
 *   PARTNER_NAME="Ryan — live smoke test" \
 *   node scripts/paystack/create-subaccount.mjs
 *
 * Prints the subaccount code (ACCT_...) — send that to the build, never the
 * secret key.
 */

const SECRET = process.env.PAYSTACK_SECRET_KEY;
const LIVE = SECRET?.startsWith("sk_live_");

if (!SECRET || !SECRET.startsWith("sk_")) {
  console.error("Set PAYSTACK_SECRET_KEY (sk_test_... or sk_live_...) in the environment.");
  process.exit(1);
}
if (LIVE && process.env.ALLOW_LIVE !== "yes") {
  console.error(
    "This is a LIVE secret key — real money, real settlement.\n" +
      "Re-run with ALLOW_LIVE=yes once you mean it, and pass your real\n" +
      "BANK_CODE and ACCOUNT_NUMBER explicitly (no dummy default in live mode).",
  );
  process.exit(1);
}
if (LIVE && (!process.env.BANK_CODE || !process.env.ACCOUNT_NUMBER)) {
  console.error(
    "Live mode requires BANK_CODE and ACCOUNT_NUMBER to be set explicitly —\n" +
      "there is no safe default for a real bank account.",
  );
  process.exit(1);
}

const API = "https://api.paystack.co";
const headers = {
  Authorization: `Bearer ${SECRET}`,
  "Content-Type": "application/json",
};

async function call(path, init) {
  const res = await fetch(`${API}${path}`, { ...init, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.status === false) {
    throw new Error(
      `${init?.method ?? "GET"} ${path} → ${res.status} ${body.message ?? ""}`,
    );
  }
  return body.data;
}

const PARTNER_NAME =
  process.env.PARTNER_NAME ??
  (LIVE ? "Live smoke test" : "Test Partner — St John's Methodist");
// A common ZAR universal branch code (Absa) — test-mode default only.
const BANK_CODE = process.env.BANK_CODE ?? "632005";
const ACCOUNT_NUMBER = process.env.ACCOUNT_NUMBER ?? "0000000000";

const COMMON_ZAR_BANKS = new Set([
  "250655", // FNB
  "051001", // Standard Bank
  "632005", // Absa
  "198765", // Nedbank
  "470010", // Capitec
]);

async function main() {
  console.log(`→ Mode: ${LIVE ? "LIVE — real money" : "test"}\n`);

  console.log("→ Fetching ZAR banks (for a valid settlement bank code)…\n");
  const banks = await call("/bank?currency=ZAR&perPage=100");
  const shortlist = banks.filter((b) => COMMON_ZAR_BANKS.has(String(b.code)));
  for (const b of shortlist.length ? shortlist : banks.slice(0, 8)) {
    console.log(`   ${String(b.code).padEnd(10)} ${b.name}`);
  }

  console.log(`\n→ Creating subaccount "${PARTNER_NAME}"…`);
  console.log(`   settlement bank ${BANK_CODE}, account ${ACCOUNT_NUMBER}\n`);

  const sub = await call("/subaccount", {
    method: "POST",
    body: JSON.stringify({
      business_name: PARTNER_NAME,
      settlement_bank: BANK_CODE,
      account_number: ACCOUNT_NUMBER,
      // 0% to the main account by default — everything (minus the Paystack fee,
      // charged to the subaccount) flows to this subaccount's bank account.
      percentage_charge: 0,
    }),
  });

  console.log("✓ Subaccount created\n");
  console.log(`   subaccount_code : ${sub.subaccount_code}`);
  console.log(`   account name    : ${sub.account_name ?? "(not resolved)"}`);
  console.log(`   settlement bank : ${sub.settlement_bank}`);
  if (LIVE) {
    console.log(
      "\nLive settlement to this bank account happens on Paystack's normal\n" +
        "schedule (commonly next business day), not instantly.",
    );
  }
  console.log(`\nSend the subaccount_code (ACCT_...) — keep the secret key private.`);
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  if (!LIVE) {
    console.error(
      "\nIf account creation is rejected in test mode, skip it — the core payment\n" +
        "loop (checkout + webhook + verify) works without a subaccount too.",
    );
  }
  process.exit(1);
});
