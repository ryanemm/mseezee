import Link from "next/link";

const STEPS = [
  {
    title: "Find a cause near you",
    body: "Funerals, families and community projects in your area — or anywhere in South Africa.",
  },
  {
    title: "Give in seconds",
    body: "Choose an amount and pay securely. No account needed.",
  },
  {
    title: "See where it goes",
    body: "Money goes to the family or a registered partner, never to MseeZee, and every contribution is receipted on the circle.",
  },
];

/** Three steps for first-time visitors — shown on home when signed out. */
export function HowItWorks() {
  return (
    <section className="flex flex-col gap-5 rounded-card bg-surface shadow-card p-6 lg:p-8">
      <h2 className="text-[1.4rem] font-bold">How MseeZee works</h2>
      <ol className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:gap-8">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4 lg:flex-col lg:gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lime font-bold text-on-lime">
              {i + 1}
            </span>
            <div>
              <p className="text-[1.08rem] font-bold text-ink">{step.title}</p>
              <p className="mt-0.5 text-ink-soft">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link href="/about/safety" className="link self-start">
        How we keep giving safe
      </Link>
    </section>
  );
}
