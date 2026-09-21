"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

type NavItem = {
  href: string;
  label: string;
  icon: (props: IconProps) => ReactElement;
  /** Only shown once signed in — meaningless (or just a sign-in prompt) before that. */
  authOnly?: boolean;
};

const items: NavItem[] = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/explore", label: "Explore", icon: SearchIcon },
  { href: "/activity", label: "Circles", icon: CirclesIcon, authOnly: true },
  { href: "/profile", label: "Profile", icon: UserIcon, authOnly: true },
];

/**
 * A floating bar rather than an edge-to-edge strip, with "Start a circle" as a
 * raised button on the right. The tabs share whatever room is left, so the bar
 * holds together with two items (signed out) or four (signed in).
 */
export function BottomNav() {
  const pathname = usePathname();
  const { status } = useSession();
  // Default to the signed-out shape while the session resolves, so the extra
  // items don't flash in and then disappear.
  const signedIn = status === "authenticated";
  const visible = items.filter((item) => !item.authOnly || signedIn);

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-1/2 z-30 w-[calc(100%-1.5rem)] max-w-[456px] -translate-x-1/2 md:hidden"
    >
      <div className="relative rounded-[28px] border border-line bg-surface/95 px-2.5 py-2 pr-[5.5rem] shadow-[0_16px_36px_-8px_rgba(27,36,29,0.28),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur">
        <ul className="flex items-stretch justify-around">
          {visible.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[0.72rem] font-semibold transition-colors ${
                    active ? "text-forest" : "text-ink-faint hover:text-ink-soft"
                  }`}
                >
                  <Icon className="size-6" filled={active} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/create"
          aria-label="Start a circle"
          className="absolute right-2.5 top-1/2 flex size-[3.75rem] -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_32%_26%,var(--forest-bright),var(--forest)_58%,var(--forest-deep))] text-surface shadow-[0_12px_22px_-6px_rgba(31,74,52,0.65),inset_0_1px_0_rgba(255,255,255,0.25)] ring-[3px] ring-gold-line/45 transition-transform active:scale-95"
        >
          <PlusIcon className="size-7" />
        </Link>
      </div>
    </nav>
  );
}

type IconProps = { className?: string; filled?: boolean };

function HomeIcon({ className, filled }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className={className} aria-hidden="true">
      <path
        d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="m15.2 15.2 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CirclesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M9.5 7h10M9.5 12h10M9.5 17h10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="4.8" cy="7" r="1.3" fill="currentColor" />
      <circle cx="4.8" cy="12" r="1.3" fill="currentColor" />
      <circle cx="4.8" cy="17" r="1.3" fill="currentColor" />
    </svg>
  );
}

function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 20c.9-3.3 3.4-5 6.5-5s5.6 1.7 6.5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
