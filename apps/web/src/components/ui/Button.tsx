import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "lime";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.95rem] font-bold transition-[opacity,background-color,filter,transform] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  // Solid near-black — the one loud element on a screen.
  primary: "bg-night text-on-night shadow-pill hover:opacity-90",
  // White pill with a soft shadow.
  secondary: "bg-surface text-ink shadow-pill hover:bg-surface-sunk",
  ghost: "text-ink hover:bg-ink/5",
  lime: "bg-lime text-on-lime shadow-lime hover:brightness-95",
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

/** "See all" as a small white pill with a near-black arrow disc. */
export function SeeAllLink({
  href,
  children = "See all",
}: {
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-surface py-1.5 pl-4 pr-1.5 text-sm font-bold text-ink shadow-pill transition-transform hover:-translate-y-px active:scale-[0.97]"
    >
      {children}
      <span className="flex size-7 items-center justify-center rounded-full bg-night text-on-night">
        <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
          <path
            d="M5 12h14m-6-6 6 6-6 6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
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
      className={`relative flex h-16 items-center justify-center rounded-full bg-night pl-6 pr-20 text-[1.05rem] font-bold text-on-night shadow-lift transition-transform active:scale-[0.99] ${className}`}
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
