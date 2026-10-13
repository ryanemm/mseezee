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
  ready: { label: "Ready to pay out", className: "bg-surface-sunk text-ink" },
  requested: { label: "Requested", className: "bg-lime text-on-lime" },
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
      <p className="rounded-card border-2 border-dashed border-line px-5 py-8 text-center text-ink-soft">
        No payouts yet.
      </p>
    );
  }
  return (
    <ul className="flex flex-col divide-y divide-line rounded-card bg-surface px-5 shadow-card">
      {disbursements.map((d) => {
        const s = STATUS[d.status];
        return (
          <li key={d.id} className="flex flex-col gap-1.5 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[1.1rem] font-bold text-ink tnum">
                {formatZAR(d.amountCents)}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide ${s.className}`}
              >
                {s.label}
              </span>
            </div>
            {showCircle && (
              <p className="text-[0.9rem] font-semibold text-ink">{d.circleTitle}</p>
            )}
            <p className="text-[0.9rem] text-ink-soft">{d.destination}</p>
            <p className="text-[0.8rem] text-ink-faint">
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
