/**
 * Domain types for MseeZee.
 *
 * These describe the shapes the web app renders. They are intentionally
 * transport-agnostic: today a mock implementation returns them, later a real
 * API (and, separately, the money-movement service) will return the same
 * shapes. Money is always integer cents, currency is always ZAR for now.
 */

export type CircleType = "funeral" | "family" | "essentials" | "community";

export type CircleStatus = "collecting" | "goal_reached" | "closed";

/**
 * How much of a circle's location is shown publicly. `exact` is never used for
 * funeral circles — publishing an address next to a running total is a safety
 * risk. Public pages show at most `area` granularity.
 */
export type LocationPrecision = "exact" | "area" | "hidden";

/**
 * Verification gates *collection*, not payout: a circle cannot take money above
 * its tier cap until identity (and, higher up, evidence) is confirmed.
 */
export type VerificationTier = "unverified" | "id_verified" | "evidence_verified";

export type AreaKind = "township" | "suburb" | "ward" | "town";

export interface Area {
  id: string;
  slug: string;
  name: string;
  kind: AreaKind;
  /** Metro or local municipality this area sits in, e.g. "City of Johannesburg". */
  municipality: string;
  province: string;
  /** Coarse centroid — used for distance sorting and the area map, never a home address. */
  lat: number;
  lng: number;
  activeCircleCount: number;
  raisedThisMonthCents: number;
  contributorCount: number;
}

/** Compact area summary denormalised onto a circle so cards render without a join. */
export interface AreaRef {
  slug: string;
  name: string;
  kind: AreaKind;
  municipality: string;
}

export interface Circle {
  id: string;
  slug: string;
  type: CircleType;
  title: string;
  /** One or two sentences shown on the card. */
  summary: string;
  /** Full story shown on the detail page. */
  story: string;
  beneficiaryName: string;
  organiserName: string;
  /** Registered partner (church, burial society, parlour) holding funds, if any. */
  proxyName?: string;
  area: AreaRef;
  locationPrecision: LocationPrecision;
  /** Shown only when precision allows it and never for funerals, e.g. "Zone 4". */
  areaSection?: string;
  goalCents: number;
  raisedCents: number;
  supporterCount: number;
  status: CircleStatus;
  verificationTier: VerificationTier;
  createdAt: string;
  /** For funerals: the service date. Contributions can continue after it. */
  eventDate?: string;
  /** Distance in km from the viewer's home area, when known. */
  distanceKm?: number;
  /** Visual key for the generated cover — no external image dependency. */
  cover: CoverArt;
}

export interface CoverArt {
  /** Drives the gradient / tone of the generated cover block — always one of
   *  the circle types, kept as the same union so the two can never drift. */
  tone: CircleType;
  /** Two-letter monogram fallback. */
  monogram: string;
}

export interface CircleUpdate {
  id: string;
  circleId: string;
  body: string;
  createdAt: string;
}

export interface Supporter {
  id: string;
  circleId: string;
  /** Already resolved for display: real name, "Anonymous", or "A neighbour". */
  displayName: string;
  amountCents: number | null;
  message?: string;
  anonymous: boolean;
  /** Contributor's own area, when they chose to show it — a locality trust signal. */
  fromAreaName?: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  blurb: string;
  kind: "push" | "card";
  /** Irreversible push rails are preferred; cards are a higher-cost fallback. */
  recommended: boolean;
  available: boolean;
}

/** The contribution form state, collected before a payment method is chosen. */
export interface ContributionDraft {
  circleId: string;
  amountCents: number;
  displayName: string;
  message: string;
  anonymous: boolean;
  showAmount: boolean;
  showArea: boolean;
  /** Contributor covers the processing fee so the family receives the full amount. */
  coverFee: boolean;
  /** Optional voluntary contribution to keep MseeZee running. */
  tipCents: number;
}

export interface ContributionReceipt {
  id: string;
  circleId: string;
  circleTitle: string;
  beneficiaryName: string;
  amountCents: number;
  feeCents: number;
  tipCents: number;
  totalChargedCents: number;
  createdAt: string;
}

export interface CircleFilter {
  areaSlug?: string;
  type?: CircleType | "all";
  sort?: "nearest" | "newest" | "ending" | "most_supported";
}

/* ------------------------------------------------------------------ *
 *  Dashboard shapes — organiser and partner views. Still mock-backed. *
 * ------------------------------------------------------------------ */

export interface ThankYouThread {
  id: string;
  circleId: string;
  supporterName: string;
  amountCents: number | null;
  supporterMessage?: string;
  /** Whether the organiser has replied / thanked this supporter yet. */
  thanked: boolean;
  createdAt: string;
}

export type DisbursementStatus =
  | "awaiting_verification"
  | "ready"
  | "requested"
  | "paid";

export interface Disbursement {
  id: string;
  circleId: string;
  circleTitle: string;
  amountCents: number;
  status: DisbursementStatus;
  /** Where the money is going on this payout. */
  destination: string;
  requestedAt?: string;
  paidAt?: string;
  /** Evidence the organiser attached, e.g. an invoice from the funeral home. */
  evidenceLabel?: string;
}

export interface CircleDashboard {
  circle: Circle;
  /** Contributions confirmed and available. */
  settledCents: number;
  /** Contributions still clearing. */
  pendingCents: number;
  /** Already paid out to the beneficiary / partner. */
  disbursedCents: number;
  supporterCount: number;
  unthankedCount: number;
  updateCount: number;
  lastContributionAt?: string;
  disbursements: Disbursement[];
}

export interface OrganiserView {
  organiserName: string;
  circles: CircleDashboard[];
}

export interface PartnerView {
  partnerName: string;
  /** Registered status shown on the partner's circles. */
  registration: string;
  circles: CircleDashboard[];
  heldCents: number;
  awaitingActionCount: number;
}
