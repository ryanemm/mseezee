"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartIcon,
  HomeIcon,
  MapIcon,
  PlusIcon,
  UserIcon,
} from "@/components/ui/Icons";

const items = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/explore", label: "Explore", icon: MapIcon },
  { href: "/create", label: "Start a circle", icon: PlusIcon, create: true },
  { href: "/activity", label: "Circles", icon: HeartIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

/** Screens with their own bottom action (Give, the create wizard) hide the
 *  bar so the two never stack. */
const HIDDEN_ON = ["/circles/", "/create"];

/**
 * A floating near-black pill with "Start a circle" as the lime disc in the
 * middle. The current tab sits in a white disc. Phone and tablet only — the
 * sidebar takes over from `md`.
 */
export function BottomNav() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <>
      {/* Keeps the end of every page clear of the floating bar. */}
      <div aria-hidden="true" className="h-32 shrink-0 md:hidden" />
      <nav
        aria-label="Primary"
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-30 w-[calc(100%-2.5rem)] max-w-[420px] -translate-x-1/2 md:hidden"
      >
        <ul className="flex items-center justify-between rounded-full bg-night p-2 shadow-float">
          {items.map(({ href, label, icon: Icon, create }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={`flex size-14 items-center justify-center rounded-full transition-[background-color,color,transform] active:scale-95 ${
                    create
                      ? "bg-lime text-on-lime"
                      : active
                        ? "bg-surface text-ink"
                        : "text-on-night/75 hover:text-on-night"
                  }`}
                >
                  <Icon className={create ? "size-7" : "size-6"} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
