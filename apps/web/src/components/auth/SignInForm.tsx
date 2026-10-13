"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

type Tab = "phone" | "email";

const inputClass =
  "rounded-2xl border border-line bg-surface px-4 py-3.5 text-[0.95rem] outline-none focus:border-ink";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [tab, setTab] = useState<Tab>("phone");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [needsName, setNeedsName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  function switchTab(next: Tab) {
    setTab(next);
    setError(null);
  }

  async function submitEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn("email-password", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

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

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn("phone-otp", { phone, code, redirect: false });
    if (res?.error) {
      setBusy(false);
      setError("That code didn't work. Try again or request a new one.");
      return;
    }
    // Sign-in only just set the session cookie — read it fresh rather than
    // trusting stale client state, to know whether this account has a name yet.
    const sessionRes = await fetch("/api/auth/session");
    const session = (await sessionRes.json().catch(() => null)) as {
      user?: { name?: string };
    } | null;
    setBusy(false);
    if (!session?.user?.name) {
      setNeedsName(true);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  async function submitName(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Could not save your name. Try again.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  if (needsName) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+3rem)] md:pt-16">
        <header className="flex flex-col items-center gap-1.5 text-center">
          <Logo className="mb-3 size-14" />
          <p className="eyebrow">Almost there</p>
          <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.03em]">What should we call you?</h1>
          <p className="text-ink-soft">
            Shown to your supporters and on any circle you organise.
          </p>
        </header>
        {error && (
          <p className="rounded-2xl bg-crit/10 px-4 py-3 text-sm text-crit">{error}</p>
        )}
        <form onSubmit={submitName} className="flex flex-col gap-4">
          <Field label="Your name">
            <input
              type="text"
              autoComplete="name"
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Lerato Mokoena"
              className={inputClass}
              required
            />
          </Field>
          <Button disabled={busy} className="w-full">
            {busy ? "Saving…" : "Continue"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+3rem)] md:pt-16">
      <header className="flex flex-col items-center gap-1.5 text-center">
        <Logo className="mb-3 size-14" />
        <p className="eyebrow">Welcome back</p>
        <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.03em]">Sign in to MseeZee</h1>
      </header>

      <div className="flex rounded-full bg-surface-sunk p-1.5">
        <TabButton active={tab === "phone"} onClick={() => switchTab("phone")}>
          Phone
        </TabButton>
        <TabButton active={tab === "email"} onClick={() => switchTab("email")}>
          Email
        </TabButton>
      </div>

      {error && (
        <p className="rounded-2xl bg-crit/10 px-4 py-3 text-sm text-crit">{error}</p>
      )}

      {tab === "phone" ? (
        !codeSent ? (
          <form onSubmit={sendCode} className="flex flex-col gap-4">
            <Field label="Cellphone number">
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="082 123 4567"
                className={inputClass}
                required
              />
            </Field>
            <Button disabled={busy} className="w-full">
              {busy ? "Sending…" : "Send code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="flex flex-col gap-4">
            <p className="text-sm text-ink-soft">
              Enter the code we sent to <span className="font-medium text-ink">{phone}</span>.
            </p>
            <Field label="Code">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className={inputClass}
                required
              />
            </Field>
            <Button disabled={busy} className="w-full">
              {busy ? "Verifying…" : "Verify & sign in"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setCodeSent(false);
                setCode("");
                setError(null);
              }}
              className="link text-sm"
            >
              Use a different number
            </button>
          </form>
        )
      ) : (
        <form onSubmit={submitEmail} className="flex flex-col gap-4">
          <Field label="Email">
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Button disabled={busy} className="w-full">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-ink-soft">
        New to MseeZee?{" "}
        <Link href="/sign-up" className="link">
          Create an account
        </Link>
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full py-3 font-semibold transition-colors ${
        active ? "bg-night text-on-night" : "text-ink-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}
