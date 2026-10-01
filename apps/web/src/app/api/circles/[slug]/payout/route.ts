import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createSubaccount, isPaystackConfigured } from "@/lib/paystack";

export const runtime = "nodejs";

type Params = { slug: string };

interface Body {
  bankCode?: string;
  bankName?: string;
  accountNumber?: string;
}

/** Sets the bank account contributions to this circle settle to. Only the
 *  circle's own organiser may set it — this is real banking detail, not
 *  public circle content, so it never goes through the shared `Circle` type. */
export async function POST(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (!isPaystackConfigured()) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  const { slug } = await params;
  const circle = await prisma.circle.findUnique({
    where: { slug },
    select: { id: true, title: true, organiserId: true },
  });
  if (!circle) {
    return NextResponse.json({ error: "Circle not found." }, { status: 404 });
  }
  if (circle.organiserId !== session.user.id) {
    return NextResponse.json({ error: "You don't manage this circle." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const bankCode = body.bankCode?.trim();
  const bankName = body.bankName?.trim();
  const accountNumber = body.accountNumber?.replace(/\s+/g, "");
  if (!bankCode || !bankName) {
    return NextResponse.json({ error: "Choose a bank." }, { status: 400 });
  }
  if (!accountNumber || !/^\d{6,17}$/.test(accountNumber)) {
    return NextResponse.json({ error: "Enter a valid account number." }, { status: 400 });
  }

  try {
    const sub = await createSubaccount({
      businessName: circle.title,
      bankCode,
      accountNumber,
    });
    const bank = await prisma.circle.update({
      where: { id: circle.id },
      data: {
        payoutSubaccountCode: sub.subaccount_code,
        payoutBankName: bankName,
        payoutAccountName: sub.account_name,
      },
      select: { payoutAccountName: true, payoutBankName: true },
    });
    return NextResponse.json({
      accountName: bank.payoutAccountName,
      bankName: bank.payoutBankName,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not set up that payout account.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
