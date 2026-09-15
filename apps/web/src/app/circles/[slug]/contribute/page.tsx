import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { StepHeader } from "@/components/contribute/StepHeader";
import { ContributeForm } from "@/components/contribute/ContributeForm";

export const metadata: Metadata = { title: "Contribute" };

export default async function ContributePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const circle = await api.getCircle(slug);
  if (!circle) notFound();

  return (
    <div className="mx-auto w-full max-w-xl pb-8">
      <StepHeader
        backHref={`/circles/${slug}`}
        step={1}
        total={3}
        title="Your contribution"
      />
      <ContributeForm circle={circle} />
    </div>
  );
}
