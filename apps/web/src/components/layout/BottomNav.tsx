"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useHideOnScrollDown } from "@/lib/use-hide-on-scroll";
import {
  HeartIcon,
  HomeIcon,
  MapIcon,
  PlusIcon,
  UserIcon,
} from "@/components/ui/Icons";

type NavItem = {
  href: string;
  label: string;
  /** Shorter label once the bar has five tabs and less room per tab. */
  shortLabel?: string;
  icon: (props: { className?: string }) => ReactElement;
  /** Only shown once signed in — meaningless to a first-time visitor. */
  authOnly?: boolean;
  create?: boolean;
};

const items: NavItem[] = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/explore", label: "Explore", icon: MapIcon },
  { href: "/create", label: "Start a circle", shortLabel: "Start", icon: PlusIcon, create: true },
  { href: "/activity", label: "My circles", icon: HeartIcon, authOnly: true },
  { href: "/profile", label: "Account", icon: UserIcon, authOnly: true },
];

/** Screens with their own bottom action (Give, the create wizard) hide the
 *  bar so the two never stack. */
const HIDDEN_ON = ["/circles/", "/create"];

/**
 * A slim white tab bar docked flat to the bottom edge, so it sits flush with
 * the browser's own toolbar rather than floating above it. Every tab has a
 * word under its icon — many visitors are here for the first time. It slides
 * away while scrolling down and returns on any scroll up. Phone and tablet
 * only — the sidebar takes over from `md`.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { status } = useSession();
  const hidden = useHideOnScrollDown();

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  // Default to the signed-out shape while the session resolves, so the extra
  // tabs don't flash in and then disappear.
  const signedIn = status === "authenticated";
  const visible = items.filter((item) => !item.authOnly || signedIn);
  const compact = visible.length > 3;

  return (
    <>
      {/* Keeps the end of every page clear of the bar. */}
      <div aria-hidden="true" className="h-[calc(4.5rem+env(safe-area-inset-bottom))] shrink-0 md:hidden" />
      <nav
        aria-label="Primary"
        className={`fixed inset-x-0 bottom-0 z-30 bg-surface/95 shadow-bar pb-[env(safe-area-inset-bottom)] backdrop-blur transition-transform duration-300 ease-out motion-reduce:transition-none md:hidden ${
          hidden ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1">
          {visible.map(({ href, label, shortLabel, icon: Icon, create }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 pb-2 pt-2 text-[0.7rem] leading-none transition-colors ${
                    active ? "font-bold text-ink" : "font-semibold text-ink-soft hover:text-ink"
                  }`}
                >
                  <span
                    className={`flex h-8 items-center justify-center rounded-full ${
                      create
                        ? "w-8 bg-night text-on-night"
                        : active
                          ? "w-14 bg-lime text-on-lime"
                          : "w-14"
                    }`}
                  >
                    <Icon className={create ? "size-5" : "size-6"} />
                  </span>
                  <span className="whitespace-nowrap">{compact ? (shortLabel ?? label) : label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
