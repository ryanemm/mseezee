import Link from "next/link";
import { ChevronRightIcon } from "./Icons";

/** An icon square, a title with a line under it, and something on the right —
 *  the row inside white list cards (profile, circles, dashboards). */
export function ListRow({
  icon,
  title,
  subtitle,
  right,
  href,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  href?: string;
}) {
  const body = (
    <>
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[1.05rem] font-bold text-ink">{title}</span>
        {subtitle && <span className="block truncate text-[0.92rem] text-ink-soft">{subtitle}</span>}
      </span>
      {right ?? (href && <ChevronRightIcon className="size-5 shrink-0 text-ink-soft" />)}
    </>
  );
  return href ? (
    <Link href={href} className="flex items-center gap-4 py-4">
      {body}
    </Link>
  ) : (
    <div className="flex items-center gap-4 py-4">{body}</div>
  );
}

export function RowIcon({
  children,
  className = "bg-surface-sunk text-ink",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${className}`}>
      {children}
    </span>
  );
}
