import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { StepHeader } from "@/components/contribute/StepHeader";
import { ContributeForm } from "@/components/contribute/ContributeForm";
import { contributionBlock } from "@/lib/contributions-open";

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
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-4 py-16 text-center">
        <h1 className="text-xl">{blocked}</h1>
        <p className="max-w-sm text-sm text-ink-soft">
          {circle.isDemo
            ? `“${circle.title}” is seeded so the app has something to show while real circles get going — it isn't a real cause.`
            : circle.payoutReady === false
              ? "The organiser hasn't added the account the money goes to yet. Check back soon."
              : "This circle has finished collecting."}
        </p>
        <Link href={`/circles/${circle.slug}`} className="pt-2 text-sm font-semibold text-forest">
          Back to the circle
        </Link>
      </div>
    );
  }

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
