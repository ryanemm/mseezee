# Payments spike — Paystack (test mode)

Proves the full contribution loop end to end with real Paystack test-mode
checkout: **initialize → hosted checkout → webhook + verify → contribution
settled**. Nothing here is production — see the caveats at the bottom.

## What was built

| Piece | Path |
| --- | --- |
| Prisma schema (Postgres) | `apps/web/prisma/schema.prisma` |
| Prisma client singleton | `apps/web/src/lib/db.ts` |
| Paystack API wrapper (server-only) | `apps/web/src/lib/paystack.ts` |
| Settle / reconcile logic | `apps/web/src/lib/payments.ts` |
| `POST /api/paystack/initialize` | starts a transaction, writes a `pending` contribution |
| `POST /api/paystack/webhook` | verifies signature, records event, settles on `charge.success` |
| Callback page | `apps/web/src/app/circles/[slug]/contribute/callback/page.tsx` — verifies with Paystack, shows the receipt |
| Payment step | `PaymentPanel` calls `initialize` and redirects to Paystack; falls back to the demo flow when no keys are set |

Two tables: `Contribution` (one per attempt, `pending → settled | failed`) and
`PaymentEvent` (raw provider events, deduped for idempotency).

## One-time setup

```bash
# from the repo root
createdb mseezee_dev             # once, needs a local Postgres
npm install                      # runs `prisma generate` via postinstall
npm run --workspace @mseezee/web db:setup   # applies migrations
cp apps/web/.env.local.example apps/web/.env.local
```

Then edit `apps/web/.env.local`:

```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...          # never commit or paste this
PAYSTACK_TEST_SUBACCOUNT=ACCT_a1ra3ba7ejkjale
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Running it

1. **Start the app**

   ```bash
   npm run dev            # http://localhost:3000
   ```

2. **Expose the webhook** (server-to-server, so it needs a public URL — the
   browser callback works on localhost fine)

   ```bash
   npx localtunnel --port 3000        # or: ngrok http 3000
   ```

3. **Set the webhook URL in Paystack** → Settings → API Keys & Webhooks (Test)
   → `https://<tunnel-host>/api/paystack/webhook`

4. **Make a test contribution.** Open a circle → Contribute → pick an amount →
   Payment → enter an email → Pay. You land on Paystack's hosted checkout.
   Use a [Paystack test card](https://paystack.com/docs/payments/test-payments)
   (e.g. `4084 0840 8408 4081`, any future expiry, CVV `408`, OTP `123456`).

5. **Confirm the loop.** After payment you're redirected to the callback page,
   which verifies with Paystack and shows the receipt. Check the database:

   ```bash
   npm run --workspace @mseezee/web db:studio
   ```

   The `Contribution` row should be `settled` with a `providerRef`, and there
   should be a `charge.success` `PaymentEvent` with `signatureValid = true`.

## How the money splits (test mode)

`initialize` sends the whole charged amount to Paystack with:

- `subaccount = PAYSTACK_TEST_SUBACCOUNT` — the partner org's settlement account
- `bearer = "subaccount"` — the subaccount absorbs Paystack's processing fee
- `transaction_charge = <tip cents>` — the optional tip is routed to the main
  (MseeZee) account

So the partner receives `amount − tip − Paystack fee`, and MseeZee receives the
tip. In production the `subaccount` is per-circle, not a single env var.

## Not done yet (deliberately)

- Real settled contributions do **not** yet flow into the circle's public
  supporter list / raised total — those still read mock fixtures. Merging the
  two is the next step.
- No email receipts, no organiser notification.
- No reconciliation job against Paystack's settlement report.

## Before going live

- Money model chosen (NPC vs Pty Ltd — see `money-model-decision.html`)
- A **MseeZee-entity** Paystack account (not a personal one) with business
  verification complete
- Paystack Connect enabled; real partner subaccounts KYC'd via the setup link
- Confirm PayShap channel availability with Paystack; otherwise keep Ozow EFT
- ~~Move the datastore off SQLite~~ — done; runs on Postgres, self-hosted on
  the Frankfurt VPS for now (see `deploy/README.md`), moving to a South
  Africa-based host before the pilot for data residency
- Attorney sign-off that the split structure stays outside TPPP designation
- POPIA Information Officer registered
