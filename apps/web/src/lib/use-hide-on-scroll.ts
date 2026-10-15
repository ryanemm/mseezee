"use client";

import { useEffect, useRef, useState } from "react";

/** Scrolled less than this from the top and the bar is always visible. */
const ALWAYS_SHOW_BELOW_PX = 24;
/** Ignore tiny scroll movements so touch jitter doesn't flicker the bar. */
const MIN_DELTA_PX = 6;

/** True while the page is scrolling down (past the very top); false again
 *  on any scroll up — for bars that get out of the way while reading. */
export function useHideOnScrollDown(): boolean {
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
