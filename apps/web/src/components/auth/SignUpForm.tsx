"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";

const inputClass =
  "rounded-xl border border-line bg-surface px-3.5 py-3 text-sm outline-none focus:border-forest";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setBusy(false);
      setError(data.error ?? "Could not create your account.");
      return;
    }

    const signInRes = await signIn("email-password", { email, password, redirect: false });
    setBusy(false);
    if (signInRes?.error) {
      // Account created, but auto-sign-in failed — send them to sign in manually.
      router.push("/sign-in");
      return;
    }
    router.push("/create");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1 text-center">
        <p className="eyebrow">Join MseeZee</p>
        <h1 className="text-2xl">Create an account</h1>
        <p className="text-sm text-ink-soft">
          You'll need this to start and manage a circle.
        </p>
      </header>

      {error && (
        <p className="rounded-xl bg-crit/10 px-3 py-2.5 text-sm text-crit">{error}</p>
      )}

      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink">
            Your name <span className="font-normal text-ink-faint">(optional)</span>
          </span>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
          />
          <span className="text-xs text-ink-faint">At least 8 characters.</span>
        </label>
        <Button disabled={busy} className="w-full">
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-forest">
          Sign in
        </Link>
      </p>
    </div>
  );
}
