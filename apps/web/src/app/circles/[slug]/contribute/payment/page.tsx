import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { isPaystackConfigured } from "@/lib/paystack";
import { StepHeader } from "@/components/contribute/StepHeader";
import { PaymentPanel } from "@/components/contribute/PaymentPanel";

export const metadata: Metadata = { title: "Payment" };

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [circle, methods] = await Promise.all([
    api.getCircle(slug),
    api.getPaymentMethods(),
  ]);
  if (!circle) notFound();

  return (
    <div className="mx-auto w-full max-w-xl pb-8">
      <StepHeader
        backHref={`/circles/${slug}/contribute`}
        step={2}
        total={3}
        title="Payment"
      />
      <PaymentPanel
        circle={circle}
        methods={methods}
        paymentsLive={isPaystackConfigured()}
      />
    </div>
  );
}
