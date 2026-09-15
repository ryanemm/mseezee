# MseeZee — architecture notes

Companion to `direct-settlement-architecture.html`. That document explored a
direct-settlement money model; a payment provider (Stitch) has since said the
"platform routes funds to third-party beneficiaries and takes a fee" use case is
**not supported** for an unlicensed intermediary. The money model is therefore
being re-decided (non-profit hold-and-disburse vs software-only vs licensed
facilitator). **The frontend is built to survive whichever way that lands.**

## Principle: decouple the UI from the money decision

```
        ┌─────────────────────────────┐
        │  apps/web  (Next.js)         │
        │  screens + @/lib/api         │
        └──────────────┬──────────────┘
                       │  MseeZeeApi interface  (packages/shared)
          ┌────────────┴────────────┐
          │                         │
   mockApi (now)          real backend client (later)
                                    │
                                    │  (money movement lives elsewhere)
                          ┌─────────┴─────────┐
                          │ apps/payments      │  webhooks, ledger,
                          │ + a licensed PSP   │  reconciliation, payouts
                          └────────────────────┘
```

`MseeZeeApi.createContribution()` returns a **receipt shape only**. It never
implies where money is held. When the model is chosen, the payment step
(`components/contribute/PaymentPanel.tsx`) hands off to the provider and the
rest of the UI is untouched.

## Packages

### `packages/shared`

| File | Purpose |
| --- | --- |
| `types.ts` | Domain shapes: `Circle`, `Area`, `Supporter`, `ContributionDraft`, … Money is always integer cents. |
| `money.ts` | Cents helpers, `formatZAR`, fee estimate, progress percent. |
| `places.ts` | Seed of SA areas (Soweto, Khayelitsha, …) with coarse centroids + `distanceKm`. Real deploy seeds from Municipal Demarcation Board wards + StatsSA/OSM suburbs. |
| `fixtures.ts` | Mock circles, updates, supporters. |
| `api.ts` | `MseeZeeApi` interface + `mockApi` in-memory implementation. |

### `apps/web`

Next.js 15 App Router. Server Components fetch through `@/lib/api`; Client
Components handle the contribute form, payment panel, area switcher, and create
wizard. The contribution draft is held in `sessionStorage` between steps
(`@/lib/draft`) — nothing sensitive, no server round-trip for the prototype.

Routes:

```
/                              home — area feed, ?area= + ?type= filters
/explore                       all areas
/areas/[slug]                  one area: month totals, leaderboard, circles
/circles/[slug]                circle detail
/circles/[slug]/supporters     full supporters list
/circles/[slug]/contribute     step 1 — amount, identity, fee, tip
        …/contribute/payment   step 2 — method + confirm (mock)
        …/contribute/done      step 3 — thank you + WhatsApp share
/create                        wizard: type → location → basics → review
/about/safety                  how verification + fund handling work
/activity /profile             stubs
```

## Location model

- **Granularity shown publicly: area (suburb / township), never a street.**
  Enforced in the create wizard (`LocationPrecision` is `area` or `hidden`;
  `exact` is never offered) and on the circle page (`AreaMiniMap` is a stylised
  marker, not a real pin, and is labelled "Approximate area · not an address").
- **Discovery is list-first.** `?area=` on the home feed drives a nearest-first
  sort using coarse centroid distance. A real map view is a later enhancement.
- **Area is self-selected**, saved in the `mz_area` cookie. No device GPS
  request.
- **Local support is a trust signal.** Supporters can show their area; the
  circle page counts "local supporters".
- Area pages (`/areas/[slug]`) are the shareable, SEO-friendly unit and the
  natural home for the "twinning" and area-champion ideas.

## Money model — what changes per option

| | Non-profit hold-and-disburse (BackaBuddy-style) | Software only (partner is merchant) | Licensed facilitator |
| --- | --- | --- | --- |
| `PaymentPanel` hands off to | MseeZee's own PSP account | the partner org's PSP account | MseeZee's sponsored PSP |
| Payout step | MseeZee disburses after vetting | none (settles to partner) | MseeZee disburses |
| Cards | fine (payout buffer absorbs chargebacks) | partner's choice | fine |
| Fee framing in UI | admin fee / tip / float | SaaS billed to partner | platform fee |
| Frontend change | payment endpoint + a payout view later | payment endpoint only | payment endpoint + payout view |

The contribute UI already carries a **0% platform fee + optional tip** framing
for funeral circles (`ContributeForm`), which fits the non-profit and
software-only options. A mandatory percentage for family/community circles can
be switched on in one place.

## Next steps

1. Decide the money model → wire `PaymentPanel` to the chosen provider.
2. Add `apps/payments` (webhooks, ledger mirror, reconciliation).
3. Phone-OTP auth; replace `mockApi` with a real client.
4. Organiser + partner dashboards (`/dashboard`).
5. Notifications (SMS via Clickatell, WhatsApp Business API).
6. Seed real `places` data; add the map view.
7. i18n scaffold (English first, then isiZulu, isiXhosa, Afrikaans, Sesotho).
