import { ButtonLink } from "@/components/ui/Button";
import { ClockIcon } from "@/components/ui/Icons";

/** A centred message screen — not found, signed out, a payment that didn't
 *  go through — with one way forward. */
export function Placeholder({
  title,
  body,
  actionHref = "/",
  actionLabel = "Back to home",
  icon,
  children,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-6 py-20 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-lime text-on-lime">
        {icon ?? <ClockIcon className="size-9" />}
      </div>
      <h1 className="text-[1.8rem] font-extrabold leading-tight">{title}</h1>
      <p className="text-ink-soft">{body}</p>
      <ButtonLink href={actionHref} className="mt-2 min-w-48">
        {actionLabel}
      </ButtonLink>
      {children}
    </div>
  );
}
