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
  Area,
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
import { AREAS, distanceKm, findArea } from "./places";
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
  listAreas(): Promise<Area[]>;
  getArea(slug: string): Promise<Area | null>;
  listCircles(filter?: CircleFilter): Promise<Circle[]>;
  getCircle(slug: string): Promise<Circle | null>;
  /** Most-supported circles in an area, for the area page leaderboard. */
  topCircles(areaSlug: string, limit?: number): Promise<Circle[]>;
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

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "payshap",
    label: "PayShap",
    blurb: "Instant, from your banking app. To a cellphone or account.",
    kind: "push",
    recommended: true,
    available: true,
  },
  {
    id: "instant_eft",
    label: "Instant EFT",
    blurb: "Pay securely from your bank. No card needed.",
    kind: "push",
    recommended: true,
    available: true,
  },
  {
    id: "capitec_pay",
    label: "Capitec Pay",
    blurb: "Approve the payment in your Capitec app.",
    kind: "push",
    recommended: false,
    available: true,
  },
  {
    id: "card",
    label: "Card",
    blurb: "Visa or Mastercard. Higher fees than paying from your bank.",
    kind: "card",
    recommended: false,
    available: true,
  },
];

const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

function withDistance(circle: Circle, fromAreaSlug?: string): Circle {
  if (!fromAreaSlug) return circle;
  const from = findArea(fromAreaSlug);
  const to = findArea(circle.area.slug);
  if (!from || !to) return circle;
  return { ...circle, distanceKm: distanceKm(from, to) };
}

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
  async listAreas() {
    await wait();
    return [...AREAS].sort((a, b) => b.activeCircleCount - a.activeCircleCount);
  },

  async getArea(slug) {
    await wait();
    return findArea(slug) ?? null;
  },

  async listCircles(filter = {}) {
    await wait();
    let result = CIRCLES.map((c) => withDistance(c, filter.areaSlug));
    if (filter.type && filter.type !== "all") {
      result = result.filter((c) => c.type === filter.type);
    }
    return sortCircles(result, filter.sort ?? "nearest");
  },

  async getCircle(slug) {
    await wait();
    return CIRCLES.find((c) => c.slug === slug) ?? null;
  },

  async topCircles(areaSlug, limit = 3) {
    await wait();
    return CIRCLES.filter((c) => c.area.slug === areaSlug)
      .sort((a, b) => b.raisedCents - a.raisedCents)
      .slice(0, limit);
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
