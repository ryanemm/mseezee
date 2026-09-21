import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Circles" };

const links = [
  {
    href: "/dashboard",
    title: "Your circles",
    body: "Manage a circle you're running — contributions, thank-you messages, payouts, updates. Sign in if you haven't.",
    tag: "Your account",
  },
  {
    href: "/dashboard/partner",
    title: "Partner dashboard",
    body: "For a burial society, church or parlour hosting circles for families — money held and payouts to record.",
    tag: "Demo · St John's Methodist",
  },
];

export default function ActivityPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-5 lg:px-8">
      <header className="flex flex-col gap-1">
        <p className="eyebrow">Circles</p>
        <h1 className="text-2xl">Your circles &amp; giving</h1>
        <p className="text-sm text-ink-soft">
          Partner-organisation accounts aren't built yet, so that dashboard
          still opens with demo data.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex flex-col gap-1.5 rounded-card border border-line bg-surface p-4 shadow-card"
            >
              <span className="text-[0.62rem] font-semibold uppercase tracking-wide text-gold">
                {l.tag}
              </span>
              <span className="font-display text-lg text-ink">{l.title}</span>
              <span className="text-sm text-ink-soft">{l.body}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="rounded-card border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-ink-faint">
        Circles you've supported as a contributor will show here once giving
        history is tied to accounts.
      </div>
    </div>
  );
}
