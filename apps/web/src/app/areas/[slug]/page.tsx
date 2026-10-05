import { notFound, permanentRedirect } from "next/navigation";
import { LEGACY_AREA_PLACES } from "@mseezee/shared";

/** Area pages were replaced by place pages. Old links (shared before the
 *  switch) redirect to the matching Stats SA main place. */
export default async function LegacyAreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = LEGACY_AREA_PLACES[slug];
  if (!place) notFound();
  permanentRedirect(`/places/${place.id}`);
}
