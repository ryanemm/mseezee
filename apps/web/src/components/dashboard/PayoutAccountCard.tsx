"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { BankIcon } from "@/components/ui/Icons";

interface Bank {
  name: string;
  code: string;
}

/** Lets the organiser set the bank account their circle's contributions
 *  settle to. Shown only to the signed-in organiser — everyone else sees
 *  nothing here, same as the rest of `/dashboard`. */
export function PayoutAccountCard({
  slug,
  initialBankName,
  initialAccountName,
}: {
  slug: string;
  initialBankName: string | null;
  initialAccountName: string | null;
}) {
  const [bankName, setBankName] = useState(initialBankName);
  const [accountName, setAccountName] = useState(initialAccountName);
  const [editing, setEditing] = useState(!initialBankName);

  const [banks, setBanks] = useState<Bank[] | null>(null);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing || banks) return;
    fetch("/api/paystack/banks")
      .then((res) => res.json())
      .then((data: { banks?: Bank[]; error?: string }) => {
        if (data.banks) setBanks(data.banks);
        else setError(data.error ?? "Could not load the bank list.");
      })
      .catch(() => setError("Could not reach the server."));
  }, [editing, banks]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const bank = banks?.find((b) => b.code === bankCode);
    if (!bank) {
      setError("Choose a bank.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/circles/${slug}/payout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankCode, bankName: bank.name, accountNumber }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      accountName?: string;
      bankName?: string;
      error?: string;
    };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not set up that payout account.");
      return;
    }
    setBankName(data.bankName ?? bank.name);
    setAccountName(data.accountName ?? null);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-4 rounded-card bg-surface p-5 shadow-card">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-lime text-on-lime">
          <BankIcon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink">
            Payouts go to {bankName}
          </p>
          <p className="text-[0.88rem] text-ink-soft">
            {accountName ?? "Account name not confirmed by the bank"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="link text-sm"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-card bg-surface p-6 shadow-card"
    >
      <div>
        <p className="text-[1.2rem] font-bold text-ink">Add a payout account</p>
        <p className="text-[0.9rem] text-ink-soft">
          {initialBankName
            ? "Contributions to this circle settle into this account."
            : "Your circle isn't open for contributions until you add the account the money goes to — the beneficiary's own, or the organisation holding the funds."}
        </p>
      </div>

      {banks === null && !error && (
        <p className="text-xs text-ink-faint">Loading banks…</p>
      )}

      {banks && (
        <select
          value={bankCode}
          onChange={(e) => setBankCode(e.target.value)}
          required
          className="rounded-2xl border border-line bg-surface px-4 py-3.5 text-[0.95rem] outline-none focus:border-ink"
        >
          <option value="" disabled>
            Choose your bank
          </option>
          {banks.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>
      )}

      <input
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        placeholder="Account number"
        inputMode="numeric"
        required
        className="rounded-2xl border border-line bg-surface px-4 py-3.5 text-[0.95rem] outline-none focus:border-ink"
      />

      {error && <p className="text-xs text-crit">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !banks} className="flex-1">
          {busy ? "Saving…" : "Save payout account"}
        </Button>
        {initialBankName && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
