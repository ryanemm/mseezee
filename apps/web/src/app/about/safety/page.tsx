import type { Metadata } from "next";
import { BackLink, PageTopBar } from "@/components/ui/IconButton";

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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] lg:px-8 lg:pt-10">
      <PageTopBar back={<BackLink href="/" />} title="Keeping giving safe" />
      <ol className="flex flex-col gap-3">
        {points.map((pt, i) => (
          <li key={pt.h} className="flex gap-4 rounded-card bg-surface p-5 shadow-card">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lime text-sm font-bold text-on-lime">
              {i + 1}
            </span>
            <div>
              <p className="text-[1.1rem] font-bold text-ink">{pt.h}</p>
              <p className="mt-1 text-ink-soft">{pt.p}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
