import Link from "next/link";
import { BackIcon } from "./Icons";

const shapes = {
  // White disc — floats over cover art and maps.
  round: "size-12 rounded-full bg-surface text-ink shadow-pill",
  // Rounded square — the back button on plain pages.
  square: "size-12 rounded-2xl bg-surface text-ink shadow-card",
};

export function iconButtonClass(shape: keyof typeof shapes = "round") {
  return `flex shrink-0 items-center justify-center transition-transform active:scale-95 ${shapes[shape]}`;
}

export function BackLink({
  href,
  label = "Back",
  shape = "square",
}: {
  href: string;
  label?: string;
  shape?: keyof typeof shapes;
}) {
  return (
    <Link href={href} aria-label={label} className={iconButtonClass(shape)}>
      <BackIcon className="size-5" />
    </Link>
  );
}

/** Back button, a centred title, and an optional control on the right — the
 *  header on every flow screen (Give, Payment, supporters, create). */
export function PageTopBar({
  back,
  title,
  right,
}: {
  back: React.ReactNode;
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3">
      {back}
      {title ? (
        <h1 className="truncate text-center text-lg font-bold tracking-tight">{title}</h1>
      ) : (
        <span />
      )}
      {right ?? <span />}
    </div>
  );
}
