import type { Supporter } from "@mseezee/shared";
import { prisma } from "@/lib/db";

/**
 * Real, settled Paystack contributions for one circle, on top of whatever the
 * mock fixtures already show. This is how a real payment shows up on the
 * public circle page and the dashboards without the fixtures knowing anything
 * about Paystack or the database.
 */
export interface LiveTotals {
  settledCents: number;
  settledCount: number;
  pendingCents: number;
  lastSettledAt?: string;
}

const ZERO_TOTALS: LiveTotals = { settledCents: 0, settledCount: 0, pendingCents: 0 };

export async function getLiveTotals(circleId: string): Promise<LiveTotals> {
  const [settled, pending, last] = await Promise.all([
    prisma.contribution.aggregate({
      where: { circleId, status: "settled" },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.contribution.aggregate({
      where: { circleId, status: "pending" },
      _sum: { amountCents: true },
    }),
    prisma.contribution.findFirst({
      where: { circleId, status: "settled" },
      orderBy: { settledAt: "desc" },
      select: { settledAt: true },
    }),
  ]);
  return {
    settledCents: settled._sum.amountCents ?? 0,
    settledCount: settled._count,
    pendingCents: pending._sum.amountCents ?? 0,
    lastSettledAt: last?.settledAt?.toISOString(),
  };
}

/** Same as `getLiveTotals`, batched — fine at this scale (a handful of circles). */
export async function getLiveTotalsBatch(
  circleIds: string[],
): Promise<Map<string, LiveTotals>> {
  const entries = await Promise.all(
    circleIds.map(async (id) => [id, await getLiveTotals(id)] as const),
  );
  return new Map(entries);
}

export async function getLiveSupporters(circleId: string): Promise<Supporter[]> {
  const rows = await prisma.contribution.findMany({
    where: { circleId, status: "settled" },
    orderBy: { settledAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    circleId: r.circleId,
    displayName: r.anonymous ? "Anonymous" : r.displayName,
    amountCents: r.showAmount ? r.amountCents : null,
    message: r.message ?? undefined,
    anonymous: r.anonymous,
    fromAreaName: undefined,
    createdAt: (r.settledAt ?? r.createdAt).toISOString(),
  }));
}

export { ZERO_TOTALS };
