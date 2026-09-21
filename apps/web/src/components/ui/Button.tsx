import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-[filter,background-color,box-shadow,transform] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Deep forest with a soft top sheen — the one loud element on a screen.
  primary:
    "bg-[linear-gradient(180deg,var(--forest-bright)_0%,var(--forest)_100%)] text-surface shadow-[0_8px_18px_-6px_rgba(31,74,52,0.55),inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110",
  // White pill with a gold hairline.
  secondary:
    "border border-gold-line/55 bg-surface text-ink shadow-pill hover:bg-surface-sunk",
  ghost: "text-forest hover:bg-forest/5",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  href,
  children,
}: {
  variant?: Variant;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
