"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

/** Sign-in link or the current user + sign-out, at the foot of the sidebar. */
export function AuthControl() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-11" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/sign-in"
        className="flex items-center justify-center rounded-full border border-line py-3 text-sm font-bold text-ink hover:bg-surface-sunk"
      >
        Sign in
      </Link>
    );
  }

  const label = session.user.name || session.user.email || session.user.phone || "Account";

  return (
    <div className="flex items-center justify-between gap-2 rounded-full bg-surface-sunk py-1.5 pl-1.5 pr-4">
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-white">
          {label.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 truncate text-sm font-semibold">{label}</span>
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="shrink-0 text-xs font-semibold text-ink-soft hover:text-crit"
      >
        Sign out
      </button>
    </div>
  );
}
