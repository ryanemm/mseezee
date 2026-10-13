import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRightIcon, GridIcon, UserIcon } from "@/components/ui/Icons";

export const metadata: Metadata = { title: "Circles" };

const links = [
  {
    href: "/dashboard",
    title: "Your circles",
    body: "Manage a circle you're running — contributions, thank-you messages, payouts, updates. Sign in if you haven't.",
    tag: "Your account",
    icon: GridIcon,
    iconClass: "bg-lime text-on-lime",
  },
  {
    href: "/dashboard/partner",
    title: "Partner dashboard",
    body: "For a burial society, church or parlour hosting circles for families — money held and payouts to record.",
    tag: "Demo · St John's Methodist",
    icon: UserIcon,
    iconClass: "bg-forest text-white",
  },
];

export default function ActivityPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pt-[calc(env(safe-area-inset-top)+1.75rem)] lg:px-8 lg:pt-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-[2.2rem] font-extrabold leading-[1.05] tracking-[-0.035em]">
          Your circles &amp; giving
        </h1>
        <p className="text-ink-soft">
          Partner-organisation accounts aren't built yet, so that dashboard
          still opens with demo data.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex items-start gap-4 rounded-card bg-surface p-5 shadow-card transition-transform active:scale-[0.99]"
            >
              <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${l.iconClass}`}>
                <l.icon className="size-6" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-ink-faint">
                  {l.tag}
                </span>
                <span className="text-[1.2rem] font-bold text-ink">{l.title}</span>
                <span className="text-[0.92rem] text-ink-soft">{l.body}</span>
              </span>
              <ChevronRightIcon className="mt-4 size-5 shrink-0 text-ink-soft" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="rounded-card border-2 border-dashed border-line px-5 py-8 text-center text-ink-soft">
        Circles you've supported as a contributor will show here once giving
        history is tied to accounts.
      </div>
    </div>
  );
}
