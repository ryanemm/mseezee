import {
  mockApi,
  type Circle,
  type CircleDashboard,
  type CircleFilter,
  type MseeZeeApi,
  type OrganiserView,
  type PartnerView,
} from "@mseezee/shared";
import {
  getLiveSupporters,
  getLiveTotals,
  getLiveTotalsBatch,
  ZERO_TOTALS,
  type LiveTotals,
} from "@/lib/liveContributions";
import {
  getDbCircleBySlug,
  listDbCircles,
  listDbCirclesByOrganiser,
} from "@/lib/liveCircles";
import { prisma } from "@/lib/db";

/**
 * The single place the app gets its data. Two sources feed every read:
 *  - `mockApi`'s fixtures (the seeded demo circles, stories, goals)
 *  - real, organiser-created circles in Prisma (`liveCircles.ts`)
 * Both get real settled-contribution totals layered on top (`liveContributions.ts`),
 * so a payment made through `/api/paystack` shows up everywhere regardless of
 * which source the circle came from.
 */

function mergeCircle(circle: Circle, live: LiveTotals): Circle {
  if (live.settledCents === 0 && live.settledCount === 0) return circle;
  return {
    ...circle,
    raisedCents: circle.raisedCents + live.settledCents,
    supporterCount: circle.supporterCount + live.settledCount,
  };
}

async function getCircle(slug: string) {
  const dbCircle = await getDbCircleBySlug(slug);
  if (dbCircle) return dbCircle; // already carries live totals

  const circle = await mockApi.getCircle(slug);
  if (!circle) return null;
  return mergeCircle(circle, await getLiveTotals(circle.id));
}

async function listCircles(filter?: CircleFilter) {
  const [mockCircles, dbCircles] = await Promise.all([
    mockApi.listCircles(filter),
    listDbCircles(filter?.areaSlug),
  ]);

  const liveMap = await getLiveTotalsBatch(mockCircles.map((c) => c.id));
  const mergedMock = mockCircles.map((c) => mergeCircle(c, liveMap.get(c.id) ?? ZERO_TOTALS));

  const typeFiltered =
    filter?.type && filter.type !== "all"
      ? dbCircles.filter((c) => c.type === filter.type)
      : dbCircles;

  // Real circles are the point of signing up — surface them first.
  let combined = [...typeFiltered, ...mergedMock];
  if (filter?.sort === "most_supported") {
    combined = combined.sort((a, b) => b.raisedCents - a.raisedCents);
  } else if (filter?.sort === "newest") {
    combined = combined.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return combined;
}

async function topCircles(areaSlug: string, limit?: number) {
  const circles = await listCircles({ areaSlug });
  return circles
    .filter((c) => c.area.slug === areaSlug)
    .sort((a, b) => b.raisedCents - a.raisedCents)
    .slice(0, limit ?? 5);
}

async function listSupporters(circleId: string, limit?: number) {
  const [mockRows, liveRows] = await Promise.all([
    mockApi.listSupporters(circleId),
    getLiveSupporters(circleId),
  ]);
  const merged = [...liveRows, ...mockRows].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  return limit ? merged.slice(0, limit) : merged;
}

async function mergeDashboard(dash: CircleDashboard): Promise<CircleDashboard> {
  const live = await getLiveTotals(dash.circle.id);
  if (live.settledCents === 0 && live.settledCount === 0 && live.pendingCents === 0) {
    return dash;
  }
  return {
    ...dash,
    circle: mergeCircle(dash.circle, live),
    settledCents: dash.settledCents + live.settledCents,
    pendingCents: dash.pendingCents + live.pendingCents,
    supporterCount: dash.supporterCount + live.settledCount,
    lastContributionAt: live.lastSettledAt ?? dash.lastContributionAt,
  };
}

/** A minimal dashboard for a freshly created circle — no fixture messages or
 *  disbursement history exists for it yet, only real contribution totals. */
async function dbCircleDashboard(circle: Circle): Promise<CircleDashboard> {
  const live = await getLiveTotals(circle.id);
  return {
    circle,
    settledCents: live.settledCents,
    pendingCents: live.pendingCents,
    disbursedCents: 0,
    supporterCount: live.settledCount,
    unthankedCount: 0,
    updateCount: 0,
    lastContributionAt: live.lastSettledAt,
    disbursements: [],
  };
}

async function getCircleDashboard(slug: string) {
  const dbCircle = await getDbCircleBySlug(slug);
  if (dbCircle) return dbCircleDashboard(dbCircle);

  const dash = await mockApi.getCircleDashboard(slug);
  return dash ? mergeDashboard(dash) : null;
}

async function getOrganiserView(): Promise<OrganiserView> {
  const view = await mockApi.getOrganiserView();
  return { ...view, circles: await Promise.all(view.circles.map(mergeDashboard)) };
}

/** The signed-in organiser's own circles — what `/dashboard` actually uses. */
export async function getMyOrganiserView(userId: string): Promise<OrganiserView> {
  const [user, circles] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    listDbCirclesByOrganiser(userId),
  ]);
  return {
    organiserName: user?.name ?? user?.email ?? user?.phone ?? "You",
    circles: await Promise.all(circles.map(dbCircleDashboard)),
  };
}

async function getPartnerView(): Promise<PartnerView> {
  const view = await mockApi.getPartnerView();
  const circles = await Promise.all(view.circles.map(mergeDashboard));
  const heldCents = circles.reduce((sum, d) => sum + d.settledCents - d.disbursedCents, 0);
  return { ...view, circles, heldCents };
}

export const api: MseeZeeApi = {
  ...mockApi,
  getCircle,
  listCircles,
  topCircles,
  listSupporters,
  getCircleDashboard,
  getOrganiserView,
  getPartnerView,
};
