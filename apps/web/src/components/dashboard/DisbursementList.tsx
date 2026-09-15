import type { Disbursement, DisbursementStatus } from "@mseezee/shared";
import { formatZAR } from "@mseezee/shared";
import { relativeDay } from "@/lib/format";

const STATUS: Record<
  DisbursementStatus,
  { label: string; className: string }
> = {
  awaiting_verification: {
    label: "Awaiting verification",
    className: "bg-warn/10 text-warn",
  },
  ready: { label: "Ready to pay out", className: "bg-forest/10 text-forest" },
  requested: { label: "Requested", className: "bg-gold-soft text-gold" },
  paid: { label: "Paid", className: "bg-good/10 text-good" },
};

export function DisbursementList({
  disbursements,
  showCircle = false,
}: {
  disbursements: Disbursement[];
  showCircle?: boolean;
}) {
  if (disbursements.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-ink-faint">
        No payouts yet.
      </p>
    );
  }
  return (
    <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface shadow-card">
      {disbursements.map((d) => {
        const s = STATUS[d.status];
        return (
          <li key={d.id} className="flex flex-col gap-1.5 p-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-ink tnum">
                {formatZAR(d.amountCents)}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide ${s.className}`}
              >
                {s.label}
              </span>
            </div>
            {showCircle && (
              <p className="text-xs font-medium text-ink-soft">{d.circleTitle}</p>
            )}
            <p className="text-xs text-ink-soft">{d.destination}</p>
            <p className="text-[0.7rem] text-ink-faint">
              {d.paidAt
                ? `Paid ${relativeDay(d.paidAt)}`
                : d.requestedAt
                  ? `Requested ${relativeDay(d.requestedAt)}`
                  : "Not yet requested"}
              {d.evidenceLabel ? ` · ${d.evidenceLabel} attached` : ""}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
