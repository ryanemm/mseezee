import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { StepHeader } from "@/components/contribute/StepHeader";
import { ContributeForm } from "@/components/contribute/ContributeForm";
import { contributionBlock } from "@/lib/contributions-open";
import { Placeholder } from "@/components/layout/Placeholder";

export const metadata: Metadata = { title: "Contribute" };

export default async function ContributePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const circle = await api.getCircle(slug);
  if (!circle) notFound();

  const blocked = contributionBlock(circle);
  if (blocked) {
    return (
      <Placeholder
        title={blocked}
        body={
          circle.isDemo
            ? `“${circle.title}” is seeded so the app has something to show while real circles get going — it isn't a real cause.`
            : circle.payoutReady === false
              ? "The organiser hasn't added the account the money goes to yet. Check back soon."
              : "This circle has finished collecting."
        }
        actionHref={`/circles/${circle.slug}`}
        actionLabel="Back to the circle"
      />
    );
  }

  return (
    <div className="min-h-dvh bg-surface">
      <div className="mx-auto w-full max-w-xl">
        <StepHeader backHref={`/circles/${slug}`} step={1} total={3} title="Give" />
        <ContributeForm circle={circle} />
      </div>
    </div>
  );
}
