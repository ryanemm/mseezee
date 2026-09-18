# MseeZee

Location-based community contribution platform for South Africa. People find
funerals, families and neighbourhood projects **in their area** and contribute in
seconds.

> Status: live at mseezee.co.za (Frankfurt VPS, build-and-test — migrates to a
> South Africa host before the pilot). Money model decided: **Pty Ltd now,
> NPC conversion planned post-pilot**, funds settle directly to the
> beneficiary (never held by MseeZee), our admin fee taken as a separate
> split. Confirmed for **partner organisations**; **individual beneficiaries**
> are wanted too but that's the same shape Stitch already declined — pending
> written confirmation from Paystack before it's treated as real. See the
> update note at the top of `money-model-decision.html`.
>
> Docs in [`docs/`](./docs):
> - `money-model-decision.html` — the decision, what's confirmed vs pending, and why (for the founders + attorney)
> - `partner-onepager.html` — explainer for burial societies / churches + discovery questions
> - `payments-spike.md` — the Paystack test-mode integration: what's built and how to run it
> - `direct-settlement-architecture.html` — earlier exploration (superseded on the money model, still useful on rails/PSPs/KYC)
> - `ARCHITECTURE.md` — how the frontend stays decoupled from the money decision

## Workspace layout

```
mseezee/
├── apps/
│   └── web/            Next.js 15 (App Router) — the member-facing app
│       ├── Dockerfile  build context is the repo root, see deploy/README.md
│       ├── prisma/     Postgres schema (auth, circles, contributions)
│       └── src/app/api/paystack/   initialize + webhook route handlers
├── packages/
│   └── shared/         Domain types, money helpers, SA places data, mock API
├── deploy/             VPS deployment: docker-compose, Apache vhost, setup README
└── docs/               Architecture notes, the money-model options, the payments spike
```

A standalone `apps/payments/` (reconciliation, ledger, settlement jobs) will be
split out once a provider and money model are locked in. For now the Paystack
**test-mode** loop lives in `apps/web` — see `docs/payments-spike.md`.

## Getting started

```bash
npm install
createdb mseezee_dev                          # once, needs a local Postgres
npm run --workspace @mseezee/web db:setup      # applies migrations
npm run dev                                    # http://localhost:3000
```

Other scripts:

```bash
npm run build      # prisma generate, typecheck shared, then next build
npm run typecheck  # all workspaces
npm run --workspace @mseezee/web db:studio   # inspect the database
```

Requires Node 20+ (developed on Node 25) and a local Postgres — Homebrew
(`brew install postgresql@17`) or Docker both work. npm workspaces — no pnpm
needed. `apps/web/.env` holds `DATABASE_URL`; `apps/web/.env.local` holds
everything secret (Paystack, SMSPortal, `AUTH_SECRET`) — copy
`.env.local.example` and fill it in.

Deploying to a VPS: see [`deploy/README.md`](./deploy/README.md) — Docker
image built by GitHub Actions, pushed to GHCR, pulled and restarted over SSH;
Apache reverse-proxies with a Let's Encrypt certificate.

To exercise the real Paystack test-mode checkout, see
[`docs/payments-spike.md`](./docs/payments-spike.md). Without keys the
contribute flow falls back to a no-op demo payment.

## How data flows today

Every screen gets its data from `@/lib/api`, which currently points at
`mockApi` from `@mseezee/shared`. `mockApi` implements the `MseeZeeApi`
interface against in-memory fixtures. A real backend implements the same
interface and nothing in the UI changes.

Money movement is **not** in this interface. The Paystack test-mode flow lives
in its own route handlers (`src/app/api/paystack/`) with its own Postgres
tables (Prisma); `PaymentPanel` calls them directly. `mockApi.createContribution`
stays as the no-key demo fallback.

## What's built

| Area | State |
| --- | --- |
| Home feed with area switcher + type filters | done |
| Circle detail (funeral / family / community treatments) | done |
| Contribute → payment → thank-you flow | done |
| Paystack **test-mode** checkout: initialize → webhook + verify → settled | done (spike) |
| Supporters list | done |
| Explore areas + per-area pages with leaderboard | done |
| Create-a-circle wizard → really persists, tied to the signed-in organiser | done |
| Auth: email+password, phone+OTP (SMSPortal), session, sign-up | done |
| Link a phone number to an existing account, from Profile | done |
| Organiser dashboard — real, per-user (was a fixed demo organiser) | done |
| Partner dashboard (burial society / church hosting circles) | done (demo data) |
| KYC, notifications beyond OTP, live Paystack keys | not started |

Dashboards are reachable from the **Activity** tab (no auth yet, so they open
with demo data: organiser = Lerato Mokoena, partner = St John's Methodist).

## Design

Warm paper ground, deep forest green primary, gold used sparingly. Funeral
circles get a darker, candle-warm treatment. Mobile-first, ~480px column.
Fraunces (display) + Plus Jakarta Sans (text). Tokens live in
`apps/web/src/app/globals.css`; light and dark are both defined.

## Safety choices baked into the UI

- Public pages show **area only**, never a street address — enforced in the
  create wizard and the circle page.
- Contributions are framed as **final** at every step.
- Circle pages state that funds go to the beneficiary or a registered partner,
  not to MseeZee.
