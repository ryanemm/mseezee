import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { relativeDay } from "@/lib/format";

export const metadata: Metadata = { title: "Supporters" };

export default async function SupportersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const circle = await api.getCircle(slug);
  if (!circle) notFound();
  const supporters = await api.listSupporters(circle.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-5 lg:px-8">
      <div className="flex items-center gap-3">
        <Link
          href={`/circles/${slug}`}
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
        <h1 className="text-xl">{circle.supporterCount} supporters</h1>
      </div>

      <p className="text-sm text-ink-soft">
        Everyone who has contributed to {circle.beneficiaryName}. Amounts are
        shown when the supporter chose to.
      </p>

      <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface shadow-card">
        {supporters.map((s) => (
          <li key={s.id} className="flex items-start justify-between gap-3 p-3.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{s.displayName}</p>
              <p className="text-xs text-ink-faint">
                {relativeDay(s.createdAt)}
                {s.fromAreaName ? ` · ${s.fromAreaName}` : ""}
              </p>
              {s.message && (
                <p className="mt-1 text-[0.85rem] text-ink-soft">“{s.message}”</p>
              )}
            </div>
            <span className="shrink-0 text-sm font-semibold text-forest tnum">
              {s.amountCents === null ? "—" : formatZAR(s.amountCents)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
