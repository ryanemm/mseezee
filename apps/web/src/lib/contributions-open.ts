import type { Circle } from "@mseezee/shared";

/** Why a circle can't take contributions right now, or `null` if it can.
 *  The UI uses this to swap the Contribute button for an explanation; the
 *  payment route re-checks the same facts on the server, which is the real
 *  boundary. Client-safe — no server imports. */
export function contributionBlock(
  circle: Pick<Circle, "isDemo" | "payoutReady" | "status">,
): string | null {
  if (circle.isDemo) return "Example circle — not open for contributions";
  if (circle.status === "closed") return "This circle is closed";
  if (circle.payoutReady === false) return "Not open for contributions yet";
  return null;
}
