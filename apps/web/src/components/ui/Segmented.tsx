import type { HTMLAttributes } from "react";

/**
 * The grey track behind a row of equal-width options, with a near-black pill
 * that slides to the chosen one. The caller renders the option buttons as
 * children (each `relative flex-1`) and keeps its own roles and state.
 */
export function SegmentedTrack({
  count,
  index,
  className = "",
  children,
  ...rest
}: {
  count: number;
  /** The chosen option's position; -1 hides the pill. */
  index: number;
  className?: string;
  children: React.ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`relative flex rounded-full bg-surface-sunk p-1.5 ${className}`} {...rest}>
      <span
        aria-hidden="true"
        className="absolute inset-y-1.5 left-1.5 rounded-full bg-night shadow-pill transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{
          width: `calc((100% - 0.75rem) / ${count})`,
          transform: `translateX(${Math.max(index, 0) * 100}%)`,
          opacity: index < 0 ? 0 : 1,
        }}
      />
      {children}
    </div>
  );
}

/** Classes for one option inside a `SegmentedTrack`. */
export function segmentClass(selected: boolean): string {
  return `relative flex-1 rounded-full px-2 py-3 text-[0.98rem] font-semibold transition-colors duration-300 ${
    selected ? "text-on-night" : "text-ink-soft hover:text-ink"
  }`;
}
