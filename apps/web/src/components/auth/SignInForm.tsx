"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "./AuthLayout";
import { AuthField, PasswordField } from "./AuthField";
import { LockIcon, MailIcon, PhoneIcon, ShieldIcon, UserIcon } from "@/components/ui/Icons";
import { SegmentedTrack, segmentClass } from "@/components/ui/Segmented";

type Tab = "phone" | "email";

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
      <AuthLayout
        eyebrow="Almost there"
        title="What should we call you?"
        subtitle="Shown to your supporters and on any circle you organise."
      >
        {error && <ErrorNote>{error}</ErrorNote>}
        <form onSubmit={submitName} className="flex flex-col gap-4">
          <AuthField
            label="Your name"
            icon={<UserIcon className="size-5" />}
            type="text"
            autoComplete="name"
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Lerato Mokoena"
            required
          />
          <Button disabled={busy} className="mt-2 w-full">
            {busy ? "Saving…" : "Continue"}
          </Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout eyebrow="Welcome back" title="Sign in to MseeZee">
      <SegmentedTrack count={2} index={tab === "phone" ? 0 : 1}>
        <TabButton active={tab === "phone"} onClick={() => switchTab("phone")}>
          Phone
        </TabButton>
        <TabButton active={tab === "email"} onClick={() => switchTab("email")}>
          Email
        </TabButton>
      </SegmentedTrack>

      {error && <ErrorNote>{error}</ErrorNote>}

      {tab === "phone" ? (
        !codeSent ? (
          <form onSubmit={sendCode} className="mz-pop flex flex-col gap-4">
            <AuthField
              label="Cellphone number"
              hint="We'll SMS you a code — no password needed."
              icon={<PhoneIcon className="size-5" />}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="082 123 4567"
              required
            />
            <Button disabled={busy} className="mt-2 w-full">
              {busy ? "Sending…" : "Send code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="mz-pop flex flex-col gap-4">
            <p className="rounded-2xl bg-lime/40 px-4 py-3 text-[0.92rem] text-ink">
              Enter the code we sent to <span className="font-bold">{phone}</span>.
            </p>
            <AuthField
              label="Code"
              icon={<ShieldIcon className="size-5" />}
              large
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              required
            />
            <Button disabled={busy} className="mt-2 w-full">
              {busy ? "Verifying…" : "Verify & sign in"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setCodeSent(false);
                setCode("");
                setError(null);
              }}
              className="link self-center text-sm"
            >
              Use a different number
            </button>
          </form>
        )
      ) : (
        <form onSubmit={submitEmail} className="mz-pop flex flex-col gap-4">
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
            icon={<LockIcon className="size-5" />}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button disabled={busy} className="mt-2 w-full">
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
    </AuthLayout>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mz-pop rounded-2xl bg-crit/10 px-4 py-3 text-sm text-crit">
      {children}
    </p>
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
      aria-pressed={active}
      className={segmentClass(active)}
    >
      {children}
    </button>
  );
}
