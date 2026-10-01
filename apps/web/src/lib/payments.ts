import { prisma } from "@/lib/db";
import { isPaystackConfigured, verifyTransaction } from "@/lib/paystack";
import type { PaystackTransaction } from "@/lib/paystack";

/**
 * Move a contribution to `settled` / `failed` from a *verified* Paystack signal.
 * Idempotent: calling it again with the same reference is a no-op once terminal.
 */
export async function reconcileFromTransaction(
  txn: Pick<
    PaystackTransaction,
    "reference" | "status" | "id" | "channel"
  >,
): Promise<"settled" | "failed" | "pending" | "unknown"> {
  const contribution = await prisma.contribution.findUnique({
    where: { reference: txn.reference },
  });
  if (!contribution) return "unknown";
  if (contribution.status === "settled") return "settled";

  if (txn.status === "success") {
    await prisma.contribution.update({
      where: { reference: txn.reference },
      data: {
        status: "settled",
        settledAt: new Date(),
        providerRef: String(txn.id),
        channel: txn.channel ?? null,
      },
    });
    return "settled";
  }

  if (txn.status === "failed" || txn.status === "abandoned") {
    await prisma.contribution.update({
      where: { reference: txn.reference },
      data: { status: "failed", failedAt: new Date() },
    });
    return "failed";
  }

  return "pending";
}

/** Give a contributor time to complete checkout and land back on the callback
 *  page before we treat their payment as abandoned rather than in-flight. */
const RECONCILE_GRACE_MS = 90_000;
const MAX_RECONCILE_PER_CALL = 8;

/**
 * Re-checks a circle's own stale-pending contributions directly with
 * Paystack. The callback page settles most contributions the moment a
 * contributor returns from checkout, and in production the webhook catches
 * the rest — but Paystack can't reach a webhook on localhost at all, and even
 * in production a contributor can close the tab before the redirect lands.
 * Without this, such a payment can succeed on Paystack and still sit
 * "pending" here forever, silently missing from the circle's total. Called
 * whenever a single circle is loaded (its page, its dashboard) — never from a
 * circle list, so browsing the home page never fans out into Paystack calls.
 */
export async function reconcilePendingContributions(circleSlug: string): Promise<void> {
  if (!isPaystackConfigured()) return;

  const stale = await prisma.contribution.findMany({
    where: {
      circleSlug,
      status: "pending",
      createdAt: { lt: new Date(Date.now() - RECONCILE_GRACE_MS) },
    },
    take: MAX_RECONCILE_PER_CALL,
    orderBy: { createdAt: "asc" },
  });

  for (const contribution of stale) {
    try {
      const txn = await verifyTransaction(contribution.reference);
      await reconcileFromTransaction({
        reference: contribution.reference,
        status: txn.status,
        id: txn.id,
        channel: txn.channel,
      });
    } catch {
      // Paystack unreachable or the reference is unknown to it — leave it
      // pending, the next view of this circle will retry.
    }
  }
}

export function newReference(): string {
  // Short, URL-safe, collision-resistant enough for the spike.
  return `mz_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}
