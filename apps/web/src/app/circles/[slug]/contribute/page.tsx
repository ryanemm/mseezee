import type { Metadata } from "next";
import Link from "next/link";
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

  if (circle.isDemo) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-4 py-16 text-center">
        <h1 className="text-xl">This is example content</h1>
        <p className="max-w-sm text-sm text-ink-soft">
          &ldquo;{circle.title}&rdquo; is seeded so the app has something to
          show while real circles get going — it isn&apos;t a real cause, and
          it isn&apos;t open for contributions.
        </p>
        <Link
          href="/"
          className="pt-2 text-sm font-semibold text-forest"
        >
          Back to circles
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
