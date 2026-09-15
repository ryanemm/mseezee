import type { ContributionDraft, ContributionReceipt } from "@mseezee/shared";

/** The contribution draft and receipt are held in sessionStorage between the
 *  form, the payment step, and the confirmation — no server round-trip needed
 *  for the prototype, and nothing sensitive is stored. */

const draftKey = (slug: string) => `mz_draft_${slug}`;
const receiptKey = (slug: string) => `mz_receipt_${slug}`;

export function saveDraft(slug: string, draft: ContributionDraft) {
  try {
    sessionStorage.setItem(draftKey(slug), JSON.stringify(draft));
  } catch {
    /* private mode / storage disabled — the next step will redirect back */
  }
}

export function loadDraft(slug: string): ContributionDraft | null {
  try {
    const raw = sessionStorage.getItem(draftKey(slug));
    return raw ? (JSON.parse(raw) as ContributionDraft) : null;
  } catch {
    return null;
  }
}

export function saveReceipt(slug: string, receipt: ContributionReceipt) {
  try {
    sessionStorage.setItem(receiptKey(slug), JSON.stringify(receipt));
  } catch {
    /* ignore */
  }
}

export function loadReceipt(slug: string): ContributionReceipt | null {
  try {
    const raw = sessionStorage.getItem(receiptKey(slug));
    return raw ? (JSON.parse(raw) as ContributionReceipt) : null;
  } catch {
    return null;
  }
}

export function clearContribution(slug: string) {
  try {
    sessionStorage.removeItem(draftKey(slug));
    sessionStorage.removeItem(receiptKey(slug));
  } catch {
    /* ignore */
  }
}
