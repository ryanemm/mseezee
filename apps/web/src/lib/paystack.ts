import crypto from "node:crypto";

/**
 * Thin server-only Paystack wrapper for the spike. Reads the secret key from the
 * environment (`PAYSTACK_SECRET_KEY`, never `NEXT_PUBLIC_`). Card data never
 * touches us — Paystack hosts the checkout — so this stays PCI SAQ-A.
 */

const BASE = "https://api.paystack.co";

function secret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

export function isPaystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

async function paystack<T>(
  path: string,
  init?: RequestInit & { body?: string },
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as {
    status?: boolean;
    message?: string;
    data?: T;
  };
  if (!res.ok || json.status === false) {
    throw new Error(
      `Paystack ${path} → ${res.status} ${json.message ?? "request failed"}`,
    );
  }
  return json.data as T;
}

export interface InitializeArgs {
  email: string;
  /** Total to charge, in ZAR cents. */
  amountCents: number;
  reference: string;
  callbackUrl: string;
  /** Partner subaccount (ACCT_...) that receives the settlement, if any. */
  subaccountCode?: string;
  /** Flat amount in cents routed to the main (MseeZee) account — the tip. */
  platformChargeCents?: number;
  metadata?: Record<string, unknown>;
  /** Restrict Paystack's checkout to these channels (e.g. ["eft"]); omit to offer everything enabled. */
  channels?: string[];
}

export interface InitializeResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializeTransaction(
  args: InitializeArgs,
): Promise<InitializeResult> {
  const body: Record<string, unknown> = {
    email: args.email,
    amount: args.amountCents, // ZAR subunit == cents
    currency: "ZAR",
    reference: args.reference,
    callback_url: args.callbackUrl,
    metadata: args.metadata ?? {},
  };
  if (args.channels?.length) body.channels = args.channels;
  if (args.subaccountCode) {
    body.subaccount = args.subaccountCode;
    // Subaccount absorbs the Paystack processing fee.
    body.bearer = "subaccount";
    if (args.platformChargeCents && args.platformChargeCents > 0) {
      body.transaction_charge = args.platformChargeCents;
    }
  }
  return paystack<InitializeResult>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface PaystackTransaction {
  id: number;
  status: "success" | "failed" | "abandoned" | "pending";
  reference: string;
  amount: number;
  currency: string;
  channel?: string;
  paid_at?: string;
  metadata?: Record<string, unknown>;
}

export async function verifyTransaction(
  reference: string,
): Promise<PaystackTransaction> {
  return paystack<PaystackTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}

export interface ZarBank {
  name: string;
  code: string;
}

let bankListCache: { at: number; banks: ZarBank[] } | null = null;
const BANK_LIST_TTL_MS = 60 * 60 * 1000;

/** ZAR settlement banks, straight from Paystack rather than a hardcoded
 *  list — bank codes differ by country and we'd rather not guess them.
 *  Cached in memory for an hour since the list barely changes. */
export async function listZarBanks(): Promise<ZarBank[]> {
  if (bankListCache && Date.now() - bankListCache.at < BANK_LIST_TTL_MS) {
    return bankListCache.banks;
  }
  const rows = await paystack<{ name: string; code: string }[]>(
    "/bank?currency=ZAR&perPage=100",
  );
  const banks = rows.map((b) => ({ name: b.name, code: b.code }));
  bankListCache = { at: Date.now(), banks };
  return banks;
}

export interface CreateSubaccountArgs {
  businessName: string;
  bankCode: string;
  accountNumber: string;
}

export interface SubaccountResult {
  subaccount_code: string;
  account_name: string | null;
  settlement_bank: string;
}

/** Creates a Paystack subaccount that keeps 100% of what it settles (0%
 *  platform cut here — MseeZee's admin fee is taken separately, per the
 *  direct-settlement money model, not skimmed off this split). */
export async function createSubaccount(
  args: CreateSubaccountArgs,
): Promise<SubaccountResult> {
  return paystack<SubaccountResult>("/subaccount", {
    method: "POST",
    body: JSON.stringify({
      business_name: args.businessName,
      settlement_bank: args.bankCode,
      account_number: args.accountNumber,
      percentage_charge: 0,
    }),
  });
}

/** HMAC-SHA512 of the raw body with the secret key, per Paystack's webhook docs. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!signature || !key) return false;
  const expected = crypto
    .createHmac("sha512", key)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
}
