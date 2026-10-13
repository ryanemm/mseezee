import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "lime";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.95rem] font-bold transition-[opacity,background-color,filter,transform] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  // Solid near-black — the one loud element on a screen.
  primary: "bg-night text-on-night hover:opacity-90",
  // White pill with a hairline.
  secondary: "border border-line bg-surface text-ink hover:bg-surface-sunk",
  ghost: "text-ink hover:bg-ink/5",
  lime: "bg-lime text-on-lime hover:brightness-95",
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

/** The big pill CTA with a lime arrow disc on its right edge — "Give to this
 *  circle", "View circle". */
export function ArrowCta({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`relative flex h-16 items-center justify-center rounded-full bg-night pl-6 pr-20 text-[1.05rem] font-bold text-on-night transition-transform active:scale-[0.99] ${className}`}
    >
      {children}
      <span className="absolute right-1.5 top-1.5 flex size-[3.25rem] items-center justify-center rounded-full bg-lime text-on-lime">
        <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
          <path
            d="M5 12h14m-6-6 6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}
