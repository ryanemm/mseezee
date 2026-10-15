"use client";

import { useEffect, useState } from "react";
import {
  type CountFormat,
  animate,
  formatCount,
  prefersReducedMotion,
  useInViewOnce,
} from "@/lib/count-up";

/**
 * A number that counts up from zero to `value` the first time it scrolls
 * into view. Screen readers get the real total straight away; the moving
 * figure is hidden from them.
 */
export function CountUp({ value, format = "zar" }: { value: number; format?: CountFormat }) {
  const [ref, inView] = useInViewOnce<HTMLSpanElement>();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }
    return animate((p) => setShown(value * p));
  }, [inView, value]);

  return (
    <span ref={ref}>
      <span className="sr-only">{formatCount(value, format)}</span>
      <span aria-hidden="true">{formatCount(shown, format)}</span>
    </span>
  );
}

/** A progress bar's fill, sweeping out from the left the first time it's seen. */
export function ProgressFill({ pct, className }: { pct: number; className: string }) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`h-full origin-left rounded-full transition-transform duration-[1800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${className}`}
      style={{ width: `${Math.max(pct, 3)}%`, transform: `scaleX(${inView ? 1 : 0})` }}
    />
  );
}
