import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "How MseeZee keeps giving safe" };

const points = [
  {
    h: "Verification before collection",
    p: "A circle can only raise a small amount before the organiser confirms their identity. Larger circles need supporting documents — for a funeral, a death certificate or a letter from the funeral home — checked by our team.",
  },
  {
    h: "Funds go to the beneficiary, not to us",
    p: "Money is received by the family or by a registered community partner acting for them. MseeZee never holds your contribution.",
  },
  {
    h: "Local eyes",
    p: "Circles show how many supporters come from the same area. People who can see a cause with their own eyes are the best check against fraud.",
  },
  {
    h: "Contributions are final",
    p: "Payments are made from your bank and cannot be reversed. Give what you intend to give. If something looks wrong, report the circle and our team will review it fast.",
  },
  {
    h: "Everything is receipted",
    p: "Every contribution appears on the supporters list and the organiser is expected to post updates on how funds are used.",
  },
];

export default function SafetyPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-full border border-line text-ink-soft"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m15 5-7 7 7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className="text-xl">Keeping giving safe</h1>
      </div>
      <ul className="flex flex-col gap-3">
        {points.map((pt) => (
          <li
            key={pt.h}
            className="rounded-card border border-line bg-surface p-4 shadow-card"
          >
            <p className="font-semibold text-ink">{pt.h}</p>
            <p className="mt-1 text-sm text-ink-soft">{pt.p}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
