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

const TONES = {
  funeral: { from: "#1a1511", to: "#4a3a28", accent: "#c8a24c" },
  family: { from: "#12331f", to: "#2f6c4a", accent: "#f1e7ca" },
  essentials: { from: "#5a2f25", to: "#a8663f", accent: "#f1e7ca" },
  community: { from: "#244a55", to: "#3f7a6c", accent: "#f1e7ca" },
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
          color: "#fffdf7",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>MseeZee</div>
          <div
            style={{
              display: "flex",
              padding: "10px 24px",
              borderRadius: 999,
              border: `2px solid ${tone.accent}`,
              color: tone.accent,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase",
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
              fontWeight: 700,
              lineHeight: 1.1,
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
                background: "linear-gradient(90deg, #2f6c4a 0%, #c8a24c 100%)",
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
