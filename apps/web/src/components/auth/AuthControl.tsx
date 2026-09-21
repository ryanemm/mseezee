"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

/** Sign-in link or the current user + sign-out, used in both the sidebar and
 *  the mobile header. */
export function AuthControl({ compact = false }: { compact?: boolean }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className={compact ? "size-10" : "h-9"} />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/sign-in"
        className={
          compact
            ? "rounded-full border border-gold-line/60 bg-surface px-5 py-2.5 text-[0.95rem] font-semibold text-forest shadow-pill"
            : "flex items-center justify-center gap-2 rounded-full border border-line py-2.5 text-sm font-semibold text-ink-soft hover:bg-surface-sunk"
        }
      >
        Sign in
      </Link>
    );
  }

  const label = session.user.name || session.user.email || session.user.phone || "Account";

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        aria-label={`Sign out of ${label}`}
        className="flex size-10 items-center justify-center rounded-full border border-gold-line/50 bg-surface text-sm font-bold text-forest shadow-pill"
      >
        {label.slice(0, 1).toUpperCase()}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2">
      <span className="min-w-0 truncate text-sm font-medium text-ink">{label}</span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="shrink-0 text-xs font-semibold text-ink-faint hover:text-crit"
      >
        Sign out
      </button>
    </div>
  );
}
