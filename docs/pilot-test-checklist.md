# Pilot test checklist

Things to test on the live site before the pilot, beyond the main flow
(create a circle → add bank details → contribute → see where the money goes).

Before starting: check which Paystack keys the live site uses
(`PAYSTACK_SECRET_KEY` in `/opt/mseezee/.env` starts with `sk_live` or
`sk_test`). With live keys the money is real, and a made-up account number is
rejected — use a real bank account you control.

## Main flow

- [ ] Create a circle by searching a sub place (e.g. "Orlando West") — the circle shows it.
- [ ] Create a funeral circle in a sub place — it shows only the main place ("Soweto").
- [ ] Add bank details in "Where the money goes" — circle opens straight away.
- [ ] Create one with "Skip for now" — shows "Not open for contributions yet" and no share
      buttons; add the account from its dashboard and confirm it opens.
- [ ] Contribute by card, and again by EFT (minimum R1).
- [ ] In the Paystack dashboard, the transaction shows the split to the circle's subaccount.
- [ ] The bank deposit arrives on Paystack's schedule (usually next business day).

## Worth adding

- [ ] **Tip** — add one; it goes to the main Paystack account, not the circle's subaccount.
- [ ] **"Cover the fee"** — the total charged matches what the screen showed.
- [ ] **Abandoned payment** — open checkout and close it without paying; the circle total
      doesn't move.
- [ ] **Closing the tab after paying** — pay, close the tab before it returns to MseeZee, wait
      two minutes, reload the circle page; the total catches up.
- [ ] **Paystack webhook** — in Paystack settings, the webhook URL is
      `https://mseezee.co.za/api/paystack/webhook`.
- [ ] **Sharing** — share to WhatsApp from the circle page and the thank-you page; the
      preview image shows. Then Facebook on a phone.
- [ ] **Anonymous contribution** — the name doesn't appear in the supporter list.
- [ ] **Contributing signed out** — no account needed.
- [ ] **Ownership** — another account opening your circle's dashboard link gets "not found".
- [ ] **Changing the bank account** — use "Change" on the dashboard, contribute again; the
      money goes to the new account.
- [ ] **Example circles** — can't be paid into.
- [ ] **On a phone** — "Find circles near me" in Safari; tapping into form fields doesn't zoom.
- [ ] **Sign-in** — stays signed in after saving bank details and moving around; no redirect
      to `localhost:3210`.

## Not built yet (wording promises them)

- **Email receipt** — the thank-you page says one follows "once it clears"; nothing sends it.
- **Organiser notification** — the thank-you page says the organiser "has been notified";
  nothing notifies them.
- **Forgot password** — no way to reset a password from the app.
- **Approval before a circle opens** — chosen as the long-term approach; for the pilot, circles
  open as soon as bank details are added, with no vetting.
