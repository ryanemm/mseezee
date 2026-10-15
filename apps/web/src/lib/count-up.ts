"use client";

import { useEffect, useRef, useState } from "react";
import { formatZAR } from "@mseezee/shared";

/** How long a count-up or a progress fill takes. */
export const COUNT_UP_MS = 1800;

export type CountFormat = "zar" | "zarCompact" | "percent";

export function formatCount(value: number, format: CountFormat): string {
  if (format === "percent") return `${Math.round(value)}%`;
  return formatZAR(Math.round(value), { compact: format === "zarCompact" });
}

/** Fast at first, settling gently onto the total. */
export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Runs `onFrame` with 0→1 progress over `COUNT_UP_MS`; returns a cancel. */
export function animate(onFrame: (progress: number) => void): () => void {
  const start = performance.now();
  let frame = requestAnimationFrame(function tick(now) {
    const t = Math.min((now - start) / COUNT_UP_MS, 1);
    onFrame(easeOut(t));
    if (t < 1) frame = requestAnimationFrame(tick);
  });
  return () => cancelAnimationFrame(frame);
}

/**
 * True from the first time the element is at least partly on screen, and
 * for good after that — so things animate once, when they're actually seen.
 */
export function useInViewOnce<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  return [ref, inView] as const;
}
