/**
 * The site's public address, for links that leave the app (Paystack's
 * return URL). Read from `AUTH_URL` at runtime — the same setting NextAuth
 * uses — because neither alternative works in production:
 *  - behind Apache, `request.url` reports Next's internal address
 *    (https://localhost:3210), not mseezee.co.za;
 *  - `NEXT_PUBLIC_*` values are baked in at build time, and the production
 *    image is built on GitHub without them.
 * Locally `AUTH_URL` is usually unset, and the request's own origin is right.
 */
export function publicAppUrl(request: Request): string {
  const configured = process.env.AUTH_URL?.trim();
  return (configured || new URL(request.url).origin).replace(/\/+$/, "");
}
