import Link from "next/link";

/** A filter pill: white and lifted when off, solid near-black when on. An
 *  optional emblem sits at its left edge and a count at its right. */
export function Pill({
  href,
  active,
  icon,
  count,
  children,
}: {
  href: string;
  active: boolean;
  icon?: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`flex h-12 shrink-0 items-center gap-2 rounded-full text-[0.95rem] font-semibold shadow-pill transition-[background-color,color,transform] hover:-translate-y-px active:scale-[0.97] ${
        icon ? "pl-1.5" : "pl-5"
      } ${count !== undefined ? "pr-2" : "pr-5"} ${
        active ? "bg-night text-on-night" : "bg-surface text-ink"
      }`}
    >
      {icon}
      <span className="whitespace-nowrap">{children}</span>
      {count !== undefined && (
        <span
          className={`min-w-7 rounded-full px-2 py-1 text-center text-[0.72rem] font-bold leading-none tnum ${
            active ? "bg-lime text-on-lime" : "bg-surface-sunk text-ink-soft"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
