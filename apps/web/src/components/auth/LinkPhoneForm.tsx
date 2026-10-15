"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const inputClass = "field";

/** Lets a signed-in user attach a verified phone number to their account —
 *  from then on, signing in with that number logs into this same account. */
export function LinkPhoneForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linked, setLinked] = useState<string | null>(null);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not send a code.");
      return;
    }
    setCodeSent(true);
  }

  async function verifyAndLink(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/link-phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; phone?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not verify that code.");
      return;
    }
    setLinked(data.phone ?? phone);
    router.refresh();
  }

  if (linked) {
    return (
      <p className="rounded-2xl bg-good/10 px-4 py-3 text-sm text-good">
        {linked} is now linked to your account.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-[32px] bg-surface p-6 shadow-card">
      <div>
        <p className="text-[1.2rem] font-bold text-ink">Add a phone number</p>
        <p className="text-[0.9rem] text-ink-soft">
          Once verified, signing in with this number logs into this account.
        </p>
      </div>

      {error && (
        <p className="rounded-2xl bg-crit/10 px-4 py-3 text-sm text-crit">{error}</p>
      )}

      {!codeSent ? (
        <form onSubmit={sendCode} className="flex gap-2">
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="082 123 4567"
            className={`flex-1 ${inputClass}`}
            required
          />
          <Button disabled={busy} variant="secondary">
            {busy ? "Sending…" : "Send code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyAndLink} className="flex flex-col gap-2">
          <p className="text-[0.9rem] text-ink-soft">
            Enter the code sent to <span className="font-medium text-ink">{phone}</span>.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className={`flex-1 ${inputClass}`}
              required
            />
            <Button disabled={busy} variant="secondary">
              {busy ? "Linking…" : "Verify"}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => {
              setCodeSent(false);
              setCode("");
              setError(null);
            }}
            className="self-start link text-xs"
          >
            Use a different number
          </button>
        </form>
      )}
    </div>
  );
}
