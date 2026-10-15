"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "./AuthLayout";
import { AuthField, PasswordField } from "./AuthField";
import { LockIcon, MailIcon, UserIcon } from "@/components/ui/Icons";

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
    <AuthLayout
      eyebrow="Join MseeZee"
      title="Create an account"
      subtitle="You'll need this to start and manage a circle."
    >
      {error && (
        <p role="alert" className="mz-pop rounded-2xl bg-crit/10 px-4 py-3 text-sm text-crit">
          {error}
        </p>
      )}

      <form onSubmit={submit} className="flex flex-col gap-4">
        <AuthField
          label={
            <>
              Your name <span className="font-normal text-ink-faint">(optional)</span>
            </>
          }
          icon={<UserIcon className="size-5" />}
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Lerato Mokoena"
        />
        <AuthField
          label="Email"
          icon={<MailIcon className="size-5" />}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <PasswordField
          label="Password"
          hint="At least 8 characters."
          icon={<LockIcon className="size-5" />}
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button disabled={busy} className="mt-2 w-full">
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/sign-in" className="link">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
