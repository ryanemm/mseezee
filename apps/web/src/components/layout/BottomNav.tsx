"use client";

import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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

/** Scrolled less than this from the top and the bar is always visible. */
const ALWAYS_SHOW_BELOW_PX = 24;
/** Ignore tiny scroll movements so touch jitter doesn't flicker the bar. */
const MIN_DELTA_PX = 6;

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
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur transition-transform duration-300 ease-out motion-reduce:transition-none md:hidden ${
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

function useHideOnScrollDown(): boolean {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    function update() {
      ticking.current = false;
      const y = Math.max(window.scrollY, 0); // iOS rubber-banding reports negatives
      const delta = y - lastY.current;

      if (y < ALWAYS_SHOW_BELOW_PX) {
        setHidden(false);
      } else if (Math.abs(delta) >= MIN_DELTA_PX) {
        setHidden(delta > 0);
      } else {
        return;
      }
      lastY.current = y;
    }

    function onScroll() {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}
