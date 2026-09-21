"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { AuthControl } from "@/components/auth/AuthControl";

/** Scrolled less than this from the top and the header is always visible. */
const ALWAYS_SHOW_BELOW_PX = 24;
/** Ignore tiny scroll movements so touch jitter doesn't flicker the header. */
const MIN_DELTA_PX = 6;

/** The compact top bar shown below the `md` breakpoint. It slides away while
 *  scrolling down and returns on any scroll up. Desktop gets the sidebar's
 *  branding instead — see `Sidebar.tsx`. */
export function MobileHeader() {
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

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between border-b border-line/70 bg-paper/85 px-5 py-3.5 backdrop-blur transition-transform duration-300 ease-out motion-reduce:transition-none md:hidden ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <Logo className="size-11" />
        <span className="font-display text-[1.75rem] font-bold leading-none tracking-tight text-forest">
          MseeZee
        </span>
      </Link>
      <AuthControl compact />
    </header>
  );
}
