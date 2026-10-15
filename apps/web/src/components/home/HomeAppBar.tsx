"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { useHideOnScrollDown } from "@/lib/use-hide-on-scroll";

/**
 * The home page's top bar on phones and tablets: the logo, and sign-in or the
 * viewer's avatar. Slides away while scrolling down and returns on any scroll
 * up. Desktop shows the logo in the sidebar instead.
 */
export function HomeAppBar({ avatar }: { avatar: string | null }) {
  const hidden = useHideOnScrollDown();

  return (
    <div
      className={`sticky top-0 z-30 -mx-5 flex items-center justify-between gap-4 bg-surface/90 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur transition-transform duration-300 ease-out motion-reduce:transition-none md:hidden ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <Logo className="size-10" />
        <span className="text-[1.35rem] font-extrabold tracking-tight">MseeZee</span>
      </Link>
      {avatar !== null ? (
        <Link
          href="/profile"
          aria-label="Your profile"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest text-base font-bold text-white"
        >
          {avatar}
        </Link>
      ) : (
        <Link
          href="/sign-in"
          className="shrink-0 rounded-full bg-night px-5 py-2.5 text-[0.92rem] font-bold text-on-night shadow-pill"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}
