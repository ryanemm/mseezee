import type { CircleType, VerificationTier } from "@mseezee/shared";
import { findCircleType } from "@mseezee/shared";

export function Chip({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-[0.68rem] font-medium text-ink-soft ${className}`}
    >
      {children}
    </span>
  );
}

export function TypeChip({
  type,
  onDark = false,
}: {
  type: CircleType;
  onDark?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] ${
        onDark
          ? "bg-white/15 text-white"
          : "bg-gold-soft text-gold"
      }`}
    >
      {findCircleType(type)?.shortLabel ?? type}
    </span>
  );
}

export function DistanceChip({
  distanceKm,
  areaName,
}: {
  distanceKm?: number;
  areaName: string;
}) {
  return (
    <Chip>
      <PinIcon />
      {distanceKm === undefined
        ? areaName
        : distanceKm === 0
          ? `${areaName} · your area`
          : `${areaName} · ${distanceKm} km`}
    </Chip>
  );
}

const TIER_COPY: Record<VerificationTier, { label: string; hint: string }> = {
  unverified: { label: "New circle", hint: "Phone verified only" },
  id_verified: { label: "ID verified", hint: "Organiser identity confirmed" },
  evidence_verified: {
    label: "Verified",
    hint: "Identity and supporting documents checked by MseeZee",
  },
};

export function VerifiedChip({ tier }: { tier: VerificationTier }) {
  const copy = TIER_COPY[tier];
  if (tier === "unverified") {
    return <Chip className="text-ink-faint">{copy.label}</Chip>;
  }
  return (
    <Chip className="border-good/30 text-good" >
      <CheckIcon />
      {copy.label}
    </Chip>
  );
}

function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21c4.5-4.2 7-7.6 7-11a7 7 0 1 0-14 0c0 3.4 2.5 6.8 7 11z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m5 13 4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
