import type { CircleType, CoverArt as CoverArtData } from "@mseezee/shared";

/**
 * Generated cover art — no uploaded photo needed. Abstract on purpose: a
 * deep wash of the circle type's colour, a soft glow, fine concentric rings
 * and one accent (a lime or amber ring, or a disc on the circle hero). Ring placement is derived from the
 * circle's monogram, so covers differ from each other but read as one set.
 * The colours are fixed (not theme tokens): it's artwork.
 */

const TONES: Record<
  CircleType,
  { base: string; light: string; dark: string; accent: string }
> = {
  community: { base: "#1f4a34", light: "#2f6c4a", dark: "#10291c", accent: "#d4f26a" },
  funeral: { base: "#3b2a20", light: "#5a4130", dark: "#211710", accent: "#f6c66b" },
  essentials: { base: "#4a3657", light: "#664c78", dark: "#2e2138", accent: "#d4f26a" },
  // Three colours only — family circles share essentials' plum.
  family: { base: "#4a3657", light: "#664c78", dark: "#2e2138", accent: "#d4f26a" },
};

export const COVER_BG: Record<CircleType, string> = {
  community: TONES.community.base,
  funeral: TONES.funeral.base,
  essentials: TONES.essentials.base,
  family: TONES.family.base,
};

const RING_RADII = [44, 84, 124, 164, 204, 244, 284];

/** A small deterministic hash, so the same circle always gets the same cover. */
function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function layout(seed: number) {
  // The accent disc stays in the upper right of the frame. Covers are cropped
  // to very different shapes (tall cards, wide heroes), and that's the one area
  // every crop shows that chips and titles never cover.
  const ax = 262 + (seed % 22);
  const ay = 44 + ((seed >>> 5) % 22);
  const ar = 14 + ((seed >>> 9) % 6);
  // The rings are centred below and to the right of it, so the disc sits on
  // one ring's upper-left arc; radius and angle vary per circle.
  const ring = RING_RADII[1 + ((seed >>> 13) % 3)] ?? 84;
  const angle = (200 + ((seed >>> 17) % 50)) * (Math.PI / 180);
  const cx = ax - ring * Math.cos(angle);
  const cy = ay - ring * Math.sin(angle);
  // A small pale moon on a nearer ring, a third of a turn away.
  const moonRing = RING_RADII[(seed >>> 21) % 2] ?? 44;
  const moonAngle = angle + (Math.PI * 2) / 3;
  return {
    cx,
    cy,
    ring,
    glowX: (ax / 400) * 100,
    glowY: (ay / 240) * 100,
    ax,
    ay,
    ar,
    mx: cx + moonRing * Math.cos(moonAngle),
    my: cy + moonRing * Math.sin(moonAngle),
  };
}

export function CoverArt({
  cover,
  className = "",
  accent = "ring",
}: {
  cover: CoverArtData;
  className?: string;
  /** `ring`: one ring drawn in the accent colour — for cards, where titles
   *  sit on the art. `disc`: a glowing accent disc — for the circle hero,
   *  where nothing does. */
  accent?: "ring" | "disc";
}) {
  const tone = TONES[cover.tone];
  const l = layout(seedFrom(`${cover.tone}:${cover.monogram}`));
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 110% at ${l.glowX}% ${l.glowY}%, ${tone.light} 0%, ${tone.base} 45%, ${tone.dark} 100%)`,
      }}
      aria-hidden="true"
    >
      <svg className="block h-full w-full" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#ffffff" strokeWidth="1.2">
          {RING_RADII.map((r, i) => (
            <circle key={r} cx={l.cx} cy={l.cy} r={r} strokeOpacity={0.16 - i * 0.018} />
          ))}
        </g>
        {accent === "disc" ? (
          <>
            <circle cx={l.ax} cy={l.ay} r={l.ar * 2} fill={tone.accent} fillOpacity="0.1" />
            <circle cx={l.ax} cy={l.ay} r={l.ar} fill={tone.accent} />
          </>
        ) : (
          <circle
            cx={l.cx}
            cy={l.cy}
            r={l.ring}
            fill="none"
            stroke={tone.accent}
            strokeOpacity="0.6"
            strokeWidth="2"
          />
        )}
        {/* A small pale moon on a nearer ring. */}
        <circle cx={l.mx} cy={l.my} r="4" fill="#ffffff" fillOpacity="0.55" />
      </svg>
    </div>
  );
}

/** The small square badge for lists, chips and tiles: the circle type as a
 *  clean line icon on its colour, with one accent stroke. */
export function CircleEmblem({
  type,
  className = "size-14 rounded-2xl",
}: {
  type: CircleType;
  className?: string;
}) {
  const tone = TONES[type];
  const line = {
    fill: "none",
    stroke: "#ffffff",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 120% at 30% 20%, ${tone.light} 0%, ${tone.base} 60%, ${tone.dark} 100%)`,
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" className="h-[62%] w-[62%]">
        {type === "community" && (
          <g>
            <path d="M16 41V17a7 7 0 0 1 7-7h4" {...line} />
            <path d="M12 41h9" {...line} />
            <rect x="26" y="7" width="12" height="6" rx="3" fill={tone.accent} />
            <path d="M29 17l-2 4M35 17l2 4" {...line} stroke={tone.accent} strokeWidth="2" />
          </g>
        )}
        {type === "funeral" && (
          <g>
            <path d="M24 6c3.6 4 3.9 7.6 0 10.6-3.9-3-3.6-6.6 0-10.6z" fill={tone.accent} />
            <rect x="18.5" y="21" width="11" height="19" rx="2.5" {...line} />
            <path d="M14 41h20" {...line} />
          </g>
        )}
        {type === "essentials" && (
          <g>
            <rect x="9" y="19" width="30" height="21" rx="3" {...line} />
            <rect x="7" y="13" width="34" height="7" rx="2.5" {...line} />
            <path d="M24 13v27" {...line} stroke={tone.accent} />
            <path
              d="M24 13c-2.5-5.5-9.5-6-8-1.5 1 2.6 5.4 2.6 8 1.5zm0 0c2.5-5.5 9.5-6 8-1.5-1 2.6-5.4 2.6-8 1.5z"
              {...line}
              stroke={tone.accent}
              strokeWidth="2"
            />
          </g>
        )}
        {type === "family" && (
          <g>
            <path d="M8 22 24 9l16 13v16.5a2.5 2.5 0 0 1-2.5 2.5h-27A2.5 2.5 0 0 1 8 38.5z" {...line} />
            <path
              d="M24 35c-4.6-3-7-5.3-7-8a3.5 3.5 0 0 1 7-1.3 3.5 3.5 0 0 1 7 1.3c0 2.7-2.4 5-7 8z"
              fill={tone.accent}
            />
          </g>
        )}
      </svg>
    </span>
  );
}
