"use client";

import { useEffect, useState } from "react";
import type { Circle } from "@mseezee/shared";
import { circleShareMessage, circleSharePath } from "@/lib/share";
import { ShareIcon } from "@/components/ui/Icons";
import { iconButtonClass } from "@/components/ui/IconButton";

type ShareableCircle = Pick<
  Circle,
  "slug" | "title" | "type" | "beneficiaryName" | "raisedCents" | "goalCents" | "area"
>;

/** Builds the absolute link on the client so it always matches whatever host
 *  the viewer is on (live site, or a local address while testing). */
function useShareUrl(slug: string): string {
  const [url, setUrl] = useState(`https://mseezee.co.za${circleSharePath(slug)}`);
  useEffect(() => {
    setUrl(`${window.location.origin}${circleSharePath(slug)}`);
  }, [slug]);
  return url;
}

/** Phones only — desktop browsers can have a share sheet too, but it doesn't
 *  list Facebook, so on a computer the web share page is the better route. */
function useIsPhone(): boolean {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    setPhone(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);
  return phone;
}

function useCanNativeShare(): boolean {
  const [can, setCan] = useState(false);
  useEffect(() => {
    setCan(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);
  return can;
}

async function nativeShare(title: string, text: string, url: string): Promise<boolean> {
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch (err) {
    // The viewer closing the share sheet isn't an error worth surfacing.
    return err instanceof DOMException && err.name === "AbortError";
  }
}

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

/** WhatsApp first and biggest — that's where most circles will travel — then
 *  the other common channels, a copy-link fallback, and the phone's own share
 *  sheet when the browser supports it. */
export function ShareCircle({
  circle,
  heading = "Share this circle",
  subheading = "The more people who see it, the faster it fills.",
  framed = true,
  message,
}: {
  circle: ShareableCircle;
  /** Overrides the default call-to-contribute, e.g. the first-person message
   *  on the thank-you page. */
  message?: string;
  heading?: string;
  subheading?: string;
  /** Card styling for the circle page; off where the parent already frames it. */
  framed?: boolean;
}) {
  const url = useShareUrl(circle.slug);
  const canNativeShare = useCanNativeShare();
  const isPhone = useIsPhone();
  const [copied, setCopied] = useState(false);
  const text = message ?? circleShareMessage(circle);

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  async function copy() {
    if (await copyToClipboard(url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const pill =
    "inline-flex items-center justify-center gap-2 rounded-full bg-surface px-4 py-3 text-sm font-bold text-ink shadow-pill transition-colors hover:bg-surface-sunk";

  return (
    <section
      className={`flex flex-col gap-3.5 ${framed ? "rounded-card bg-surface shadow-card p-5 lg:p-6" : ""}`}
    >
      <div className={framed ? "" : "text-center"}>
        <h2 className="text-[1.3rem] font-bold">{heading}</h2>
        <p className="text-ink-soft">{subheading}</p>
      </div>

      <a
        href={whatsapp}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-5 text-[1rem] font-bold text-white shadow-pill transition-[filter,transform] hover:brightness-105 active:scale-[0.99]"
      >
        <WhatsAppIcon />
        Share on WhatsApp
      </a>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {/* On phones the Facebook app intercepts its own web share link and
            opens the feed without the link, so go through the share sheet,
            whose Facebook option opens the post composer with the link. */}
        {isPhone && canNativeShare ? (
          <button
            type="button"
            onClick={() => nativeShare(circle.title, text, url)}
            className={pill}
          >
            Facebook
          </button>
        ) : (
          <a href={facebook} target="_blank" rel="noreferrer" className={pill}>
            Facebook
          </a>
        )}
        <a href={x} target="_blank" rel="noreferrer" className={pill}>
          X
        </a>
        <button type="button" onClick={copy} className={pill}>
          {copied ? "Link copied" : "Copy link"}
        </button>
        {canNativeShare && (
          <button
            type="button"
            onClick={() => nativeShare(circle.title, text, url)}
            className={pill}
          >
            More…
          </button>
        )}
      </div>
    </section>
  );
}

/** The round share button on the circle hero — opens the phone's share
 *  sheet where available, otherwise copies the link. */
export function ShareIconButton({ circle }: { circle: ShareableCircle }) {
  const url = useShareUrl(circle.slug);
  const [copied, setCopied] = useState(false);

  async function share() {
    if (typeof navigator.share === "function") {
      if (await nativeShare(circle.title, circleShareMessage(circle), url)) return;
    }
    if (await copyToClipboard(url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={share}
        aria-label="Share this circle"
        className={iconButtonClass("round")}
      >
        <ShareIcon className="size-[22px]" />
      </button>
      {copied && (
        <span
          role="status"
          className="absolute right-0 top-full mt-2 whitespace-nowrap rounded-full bg-night px-3 py-1.5 text-xs font-bold text-on-night"
        >
          Link copied
        </span>
      )}
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.2-1.4A9.9 9.9 0 1 0 12.04 2zm0 18.1a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3a8.2 8.2 0 1 1 7 3.9zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}
