"use client";

import { signOut } from "next-auth/react";
import { SignOutIcon } from "@/components/ui/Icons";

/** Sign-out as a square icon button (profile header) or a full list row. */
export function SignOutButton({ variant = "icon" }: { variant?: "icon" | "row" }) {
  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex w-full items-center gap-4 py-4 text-left"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-crit/10 text-crit">
          <SignOutIcon className="size-6" />
        </span>
        <span className="text-[1.05rem] font-bold text-crit">Sign out</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      aria-label="Sign out"
      title="Sign out"
      className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-ink shadow-card transition-transform active:scale-95"
    >
      <SignOutIcon className="size-6" />
    </button>
  );
}
