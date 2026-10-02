import type { Circle } from "@mseezee/shared";
import { formatZAR } from "@mseezee/shared";

type ShareableCircle = Pick<
  Circle,
  "slug" | "title" | "type" | "beneficiaryName" | "raisedCents" | "goalCents"
>;

export function circleSharePath(slug: string): string {
  return `/circles/${slug}`;
}

/** The message that goes out with the link. Short enough to read in a chat
 *  bubble before the preview card, and funerals get a gentler tone. */
export function circleShareText(circle: ShareableCircle): string {
  const progress = `${formatZAR(circle.raisedCents, { compact: true })} of ${formatZAR(
    circle.goalCents,
    { compact: true },
  )} raised so far.`;
  if (circle.type === "funeral") {
    const name = circle.beneficiaryName.replace(/ family$/i, "");
    return `${circle.title}. Please help the ${name} family with the funeral costs — ${progress}`;
  }
  return `${circle.title} — ${progress} Every contribution helps.`;
}
