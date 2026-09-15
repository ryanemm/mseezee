import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { ThankYou } from "@/components/contribute/ThankYou";

export const metadata: Metadata = { title: "Thank you" };

export default async function DonePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const circle = await api.getCircle(slug);
  if (!circle) notFound();
  return <ThankYou circle={circle} />;
}
