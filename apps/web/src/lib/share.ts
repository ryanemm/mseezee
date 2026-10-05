import type { Circle } from "@mseezee/shared";
import { formatZAR } from "@mseezee/shared";

type ShareableCircle = Pick<
  Circle,
  "slug" | "title" | "type" | "beneficiaryName" | "raisedCents" | "goalCents" | "area"
>;

export function circleSharePath(slug: string): string {
  return `/circles/${slug}`;
}

/**
 * The call to contribute. Used as the preview-card description (what Facebook
 * shows, since Facebook never lets a site pre-fill a post) and as the start of
 * the WhatsApp/X message. Funerals get a gentler ask.
 */
export function circleShareText(circle: ShareableCircle): string {
  const progress = `${formatZAR(circle.raisedCents, { compact: true })} of ${formatZAR(
    circle.goalCents,
    { compact: true },
  )} raised so far`;
  if (circle.type === "funeral") {
    const name = circle.beneficiaryName.replace(/ family$/i, "");
    return `${circle.title}. Please stand with the ${name} family and contribute towards the funeral costs — ${progress}. Every rand helps.`;
  }
  return `Please support "${circle.title}" in ${circle.area.name}. ${progress} — every contribution counts, big or small.`;
}

/** The full chat message: the call to contribute plus a lead-in for the link. */
export function circleShareMessage(circle: ShareableCircle): string {
  return `${circleShareText(circle)} Contribute here:`;
}

/** What a supporter sends after contributing — first person, so it reads as
 *  a personal ask from someone the recipient knows. Their amount is left out
 *  on purpose; that's theirs to mention if they want to. */
export function circleSupporterMessage(circle: ShareableCircle): string {
  const progress = `${formatZAR(circle.raisedCents, { compact: true })} of ${formatZAR(
    circle.goalCents,
    { compact: true },
  )} raised so far`;
  if (circle.type === "funeral") {
    const name = circle.beneficiaryName.replace(/ family$/i, "");
    return `I've just contributed to help the ${name} family with the funeral costs (${circle.title}). ${progress}. If you can, here's how you can help too:`;
  }
  return `I've just contributed to "${circle.title}" in ${circle.area.name}. ${progress} — here's how you can help too:`;
}
