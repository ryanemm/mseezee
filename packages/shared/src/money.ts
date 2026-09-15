/** Money helpers. Everything internal is integer cents; ZAR only for now. */

export const CURRENCY = "ZAR";

/** Processing-fee model used for display math (contributor-covers-fee toggle). */
export const FEE_RATE = 0.02; // ~2% push-rail estimate; confirm with PSP
export const FEE_FIXED_CENTS = 100; // R1.00

export function randToCents(rand: number): number {
  return Math.round(rand * 100);
}

export function centsToRand(cents: number): number {
  return cents / 100;
}

/**
 * Format cents as a rand string. `compact` renders R18.8k for dense card UI.
 */
export function formatZAR(
  cents: number,
  opts: { compact?: boolean; withDecimals?: boolean } = {},
): string {
  const rand = cents / 100;
  if (opts.compact && Math.abs(rand) >= 1000) {
    const thousands = rand / 1000;
    const digits = thousands >= 100 ? 0 : 1;
    return `R${thousands.toFixed(digits).replace(/\.0$/, "")}k`;
  }
  const formatted = new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: opts.withDecimals ? 2 : 0,
    maximumFractionDigits: opts.withDecimals ? 2 : 0,
  }).format(rand);
  return `R${formatted}`;
}

/** Parse loose rand input ("R 1 200", "1200.50") to cents. Returns 0 on junk. */
export function parseRandInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

export function estimateFeeCents(amountCents: number): number {
  return Math.round(amountCents * FEE_RATE) + FEE_FIXED_CENTS;
}

export function progressPercent(raisedCents: number, goalCents: number): number {
  if (goalCents <= 0) return 0;
  return Math.min(100, Math.round((raisedCents / goalCents) * 100));
}
