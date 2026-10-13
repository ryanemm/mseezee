import { ImageResponse } from "next/og";
import { findCircleType, formatZAR, progressPercent } from "@mseezee/shared";
import { api } from "@/lib/api";

// The preview card WhatsApp, Facebook and X show when a circle's link is
// shared. Rendered on request from the circle's live totals, so a link shared
// later shows the progress at that time (each app caches its own copy).
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A MseeZee circle";

// Same deep cover colours as the in-app cover art (see COVER_BG in CoverArt.tsx).
const TONES = {
  funeral: { from: "#2c1f17", to: "#3b2a20", accent: "#c8a24c", bar: "#c8a24c" },
  family: { from: "#6f3524", to: "#8a4630", accent: "#d4f26a", bar: "#d4f26a" },
  essentials: { from: "#3d2c48", to: "#4a3657", accent: "#d4f26a", bar: "#d4f26a" },
  community: { from: "#12301f", to: "#1f4a34", accent: "#d4f26a", bar: "#d4f26a" },
} as const;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const circle = await api.getCircle(slug);

  if (!circle) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            background: "#1f4a34",
            color: "#fffdf7",
            fontSize: 72,
            fontWeight: 700,
          }}
        >
          MseeZee
        </div>
      ),
      size,
    );
  }

  const tone = TONES[circle.type];
  const pct = Math.min(100, progressPercent(circle.raisedCents, circle.goalCents));
  const label = findCircleType(circle.type)?.shortLabel ?? circle.type;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px 72px",
          background: `linear-gradient(135deg, ${tone.from} 0%, ${tone.to} 100%)`,
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>MseeZee</div>
          <div
            style={{
              display: "flex",
              padding: "10px 24px",
              borderRadius: 999,
              background: tone.accent,
              color: "#151815",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {label}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: circle.title.length > 40 ? 60 : 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {circle.title}
          </div>
          <div style={{ display: "flex", fontSize: 30, opacity: 0.8 }}>
            {circle.area.name} · {circle.area.municipality}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 22,
              borderRadius: 999,
              background: "rgba(255,253,247,0.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                width: `${Math.max(pct, 3)}%`,
                height: "100%",
                borderRadius: 999,
                background: tone.bar,
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32 }}>
            <div style={{ display: "flex", fontWeight: 700 }}>
              {formatZAR(circle.raisedCents, { compact: true })} raised of{" "}
              {formatZAR(circle.goalCents, { compact: true })}
            </div>
            <div style={{ display: "flex", opacity: 0.8 }}>
              {circle.supporterCount} supporters
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
