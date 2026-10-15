"use client";

import type { InputHTMLAttributes } from "react";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/ui/Icons";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

/** A labelled field with an icon inside its left edge. */
export function AuthField({
  label,
  hint,
  icon,
  trailing,
  large = false,
  ...input
}: {
  label: React.ReactNode;
  hint?: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  /** Big, widely spaced digits — for one-time codes. */
  large?: boolean;
} & InputProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-semibold text-ink">{label}</span>
      <span className="field-within flex items-center gap-3 px-4">
        <span className="shrink-0 text-ink-faint">{icon}</span>
        <input
          {...input}
          className={`min-w-0 flex-1 bg-transparent py-3.5 text-ink placeholder:text-ink-faint focus:outline-none ${
            large
              ? "text-[1.5rem] font-bold tracking-[0.45em] placeholder:tracking-[0.45em] tnum"
              : "text-[0.95rem]"
          }`}
        />
        {trailing}
      </span>
      {hint && <span className="text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

/** A password field with a show/hide toggle. */
export function PasswordField(props: { label: string; hint?: string; icon: React.ReactNode } & InputProps) {
  const [shown, setShown] = useState(false);
  return (
    <AuthField
      {...props}
      type={shown ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          className="-mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-sunk hover:text-ink"
        >
          {shown ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
        </button>
      }
    />
  );
}
