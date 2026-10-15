import type { CircleType, VerificationTier } from "@mseezee/shared";
import { findCircleType } from "@mseezee/shared";
import { CheckIcon, PinIcon } from "./Icons";

export function Chip({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 shadow-pill text-[0.8rem] font-semibold leading-tight text-ink ${className}`}
    >
      {children}
    </span>
  );
}

/** Smaller chips for tight spots — the square home cards. */
const COMPACT = "px-2.5 py-1 text-[0.72rem]";
const REGULAR = "px-3.5 py-1.5 text-[0.82rem]";

export function TypeChip({
  type,
  onDark = false,
  compact = false,
}: {
  type: CircleType;
  onDark?: boolean;
  compact?: boolean;
}) {
  const label = findCircleType(type)?.shortLabel ?? type;
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold leading-tight ${compact ? COMPACT : REGULAR} ${
        onDark ? "bg-shade/40 text-white backdrop-blur-sm" : "bg-surface-sunk text-ink"
      }`}
    >
      {label}
    </span>
  );
}

export function ExampleChip({
  onDark = false,
  compact = false,
}: {
  onDark?: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-dashed font-bold uppercase leading-tight tracking-[0.06em] ${
        compact ? "px-2 py-[3px] text-[0.6rem]" : "px-3 py-1.5 text-[0.75rem]"
      } ${
        onDark ? "border-white/50 text-white/85" : "border-ink-faint/60 text-ink-faint"
      }`}
    >
      Example
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
      <PinIcon className="size-4 shrink-0" />
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

export function VerifiedChip({
  tier,
  onDark = false,
  compact = false,
}: {
  tier: VerificationTier;
  onDark?: boolean;
  compact?: boolean;
}) {
  const copy = TIER_COPY[tier];
  if (tier === "unverified") {
    return (
      <span
        title={copy.hint}
        className={`inline-flex items-center rounded-full font-bold leading-tight ${compact ? COMPACT : REGULAR} ${
          onDark ? "bg-shade/40 text-white/85 backdrop-blur-sm" : "bg-surface-sunk text-ink-soft"
        }`}
      >
        {copy.label}
      </span>
    );
  }
  return (
    <span
      title={copy.hint}
      className={`inline-flex items-center gap-1 rounded-full bg-lime font-bold leading-tight text-on-lime ${compact ? COMPACT : REGULAR}`}
    >
      <CheckIcon className={compact ? "size-3.5" : "size-4"} />
      {copy.label}
    </span>
  );
}
