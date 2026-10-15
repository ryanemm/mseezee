import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatZAR } from "@mseezee/shared";
import { api } from "@/lib/api";
import { initials, relativeDay } from "@/lib/format";
import { BackLink, PageTopBar } from "@/components/ui/IconButton";

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
    <div className="min-h-dvh bg-surface">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+1.25rem)] lg:px-8 lg:pt-10">
        <PageTopBar
          back={<BackLink href={`/circles/${slug}`} />}
          title={`${circle.supporterCount} supporters`}
        />

        <p className="text-center text-ink-soft">
          Everyone who has contributed to {circle.beneficiaryName}. Amounts are
          shown when the supporter chose to.
        </p>

        <ul className="flex flex-col divide-y divide-line rounded-card bg-surface shadow-card px-5">
          {supporters.map((s) => (
            <li key={s.id} className="flex items-start gap-3.5 py-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-sunk text-sm font-bold text-ink">
                {initials(s.displayName)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate font-bold text-ink">{s.displayName}</p>
                  <span className="shrink-0 font-bold text-ink tnum">
                    {s.amountCents === null ? "—" : formatZAR(s.amountCents)}
                  </span>
                </div>
                <p className="text-[0.85rem] text-ink-soft">
                  {relativeDay(s.createdAt)}
                  {s.fromAreaName ? ` · ${s.fromAreaName}` : ""}
                </p>
                {s.message && (
                  <p className="mt-1.5 text-[0.92rem] text-ink-soft">“{s.message}”</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
