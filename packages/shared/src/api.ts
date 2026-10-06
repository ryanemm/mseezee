/**
 * The API surface the web app talks to.
 *
 * `mockApi` below is an in-memory implementation used for the prototype. A real
 * implementation (REST or RPC against the MseeZee backend) implements the same
 * interface, so screens never change. Money movement is deliberately *not* here
 * — `createContribution` returns a receipt shape only; the actual charge is
 * handed to a payment provider by a separate service.
 */

import type {
  Circle,
  CircleDashboard,
  CircleFilter,
  CircleUpdate,
  ContributionDraft,
  ContributionReceipt,
  OrganiserView,
  PartnerView,
  PaymentMethod,
  Supporter,
  ThankYouThread,
} from "./types";
import {
  CIRCLES,
  DEMO_ORGANISER,
  DEMO_PARTNER,
  DEMO_PARTNER_REGISTRATION,
  DISBURSEMENTS,
  SUPPORTERS,
  THANK_YOUS,
  UPDATES,
} from "./fixtures";
import { estimateFeeCents } from "./money";

export interface MseeZeeApi {
  listCircles(filter?: CircleFilter): Promise<Circle[]>;
  getCircle(slug: string): Promise<Circle | null>;
  listSupporters(circleId: string, limit?: number): Promise<Supporter[]>;
  listUpdates(circleId: string): Promise<CircleUpdate[]>;
  getPaymentMethods(): Promise<PaymentMethod[]>;
  createContribution(draft: ContributionDraft): Promise<ContributionReceipt>;

  /** The demo organiser's circles with their dashboard summaries. */
  getOrganiserView(): Promise<OrganiserView>;
  getCircleDashboard(slug: string): Promise<CircleDashboard | null>;
  listThankYous(circleId: string): Promise<ThankYouThread[]>;
  /** The demo partner organisation's hosted circles and money held. */
  getPartnerView(): Promise<PartnerView>;
}

// Only card is switched on at Paystack for now. To turn a method on, set
// `available: true` (and drop `comingSoon`) once Paystack has enabled it.
const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "card",
    label: "Card",
    blurb: "Visa or Mastercard, credit or debit.",
    kind: "card",
    recommended: false,
    available: true,
  },
  {
    id: "instant_eft",
    label: "Instant EFT",
    blurb: "Pay securely from your bank. No card needed.",
    kind: "push",
    recommended: true,
    available: false,
    comingSoon: true,
  },
  {
    id: "payshap",
    label: "PayShap",
    blurb: "Instant, from your banking app. To a cellphone or account.",
    kind: "push",
    recommended: true,
    available: false,
    comingSoon: true,
  },
  {
    id: "capitec_pay",
    label: "Capitec Pay",
    blurb: "Approve the payment in your Capitec app.",
    kind: "push",
    recommended: false,
    available: false,
  },
];

const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

function sortCircles(circles: Circle[], sort: CircleFilter["sort"]): Circle[] {
  const copy = [...circles];
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "most_supported":
      return copy.sort((a, b) => b.supporterCount - a.supporterCount);
    case "ending":
      return copy.sort((a, b) => {
        const av = a.eventDate ?? "9999";
        const bv = b.eventDate ?? "9999";
        return av.localeCompare(bv);
      });
    case "nearest":
    default:
      return copy.sort(
        (a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999),
      );
  }
}

export const mockApi: MseeZeeApi = {
  async listCircles(filter = {}) {
    await wait();
    let result = filter.placeId
      ? CIRCLES.filter(
          (c) => c.area.id === filter.placeId || c.area.mainPlaceId === filter.placeId,
        )
      : CIRCLES;
    if (filter.type && filter.type !== "all") {
      result = result.filter((c) => c.type === filter.type);
    }
    return sortCircles(result, filter.sort ?? "newest");
  },

  async getCircle(slug) {
    await wait();
    return CIRCLES.find((c) => c.slug === slug) ?? null;
  },

  async listSupporters(circleId, limit) {
    await wait();
    const rows = SUPPORTERS.filter((s) => s.circleId === circleId).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    return limit ? rows.slice(0, limit) : rows;
  },

  async listUpdates(circleId) {
    await wait();
    return UPDATES.filter((u) => u.circleId === circleId).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  async getPaymentMethods() {
    await wait();
    return PAYMENT_METHODS;
  },

  async createContribution(draft) {
    await wait(400);
    const circle = CIRCLES.find((c) => c.id === draft.circleId);
    if (!circle) throw new Error("circle not found");
    const feeCents = draft.coverFee ? estimateFeeCents(draft.amountCents) : 0;
    const totalChargedCents = draft.amountCents + feeCents + draft.tipCents;
    return {
      id: `contribution_${Date.now()}`,
      circleId: circle.id,
      circleTitle: circle.title,
      beneficiaryName: circle.beneficiaryName,
      amountCents: draft.amountCents,
      feeCents,
      tipCents: draft.tipCents,
      totalChargedCents,
      createdAt: new Date().toISOString(),
    };
  },

  async getOrganiserView() {
    await wait();
    const circles = CIRCLES.filter(
      (c) => c.organiserName === DEMO_ORGANISER,
    ).map(buildDashboard);
    return { organiserName: DEMO_ORGANISER, circles };
  },

  async getCircleDashboard(slug) {
    await wait();
    const circle = CIRCLES.find((c) => c.slug === slug);
    return circle ? buildDashboard(circle) : null;
  },

  async listThankYous(circleId) {
    await wait();
    return THANK_YOUS.filter((t) => t.circleId === circleId).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  async getPartnerView() {
    await wait();
    const circles = CIRCLES.filter(
      (c) => c.proxyName === DEMO_PARTNER,
    ).map(buildDashboard);
    const heldCents = circles.reduce(
      (sum, d) => sum + d.settledCents - d.disbursedCents,
      0,
    );
    const awaitingActionCount = circles.reduce(
      (n, d) =>
        n +
        d.disbursements.filter(
          (x) => x.status === "requested" || x.status === "ready",
        ).length,
      0,
    );
    return {
      partnerName: DEMO_PARTNER,
      registration: DEMO_PARTNER_REGISTRATION,
      circles,
      heldCents,
      awaitingActionCount,
    };
  },
};

function buildDashboard(circle: Circle): CircleDashboard {
  const supporters = SUPPORTERS.filter((s) => s.circleId === circle.id);
  const disbursements = DISBURSEMENTS.filter((d) => d.circleId === circle.id);
  const disbursedCents = disbursements
    .filter((d) => d.status === "paid")
    .reduce((sum, d) => sum + d.amountCents, 0);
  // Treat ~92% of the headline raised as settled, the rest as still clearing.
  const settledCents = Math.round(circle.raisedCents * 0.92);
  const pendingCents = circle.raisedCents - settledCents;
  const unthankedCount = THANK_YOUS.filter(
    (t) => t.circleId === circle.id && !t.thanked,
  ).length;
  const updateCount = UPDATES.filter((u) => u.circleId === circle.id).length;
  const lastContributionAt = supporters
    .map((s) => s.createdAt)
    .sort()
    .at(-1);
  return {
    circle,
    settledCents,
    pendingCents,
    disbursedCents,
    supporterCount: circle.supporterCount,
    unthankedCount,
    updateCount,
    lastContributionAt,
    disbursements,
  };
}
