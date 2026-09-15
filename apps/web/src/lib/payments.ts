import { prisma } from "@/lib/db";
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

export function newReference(): string {
  // Short, URL-safe, collision-resistant enough for the spike.
  return `mz_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}
