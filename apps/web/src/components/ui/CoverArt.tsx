import type { CoverArt as CoverArtData } from "@mseezee/shared";

const TONES: Record<
  CoverArtData["tone"],
  { from: string; to: string; ink: string; ring: string }
> = {
  funeral: {
    from: "#1a1511",
    to: "#4a3a28",
    ink: "#f4e8d0",
    ring: "#c8a24c",
  },
  family: {
    from: "#1f4a34",
    to: "#3a7a54",
    ink: "#f3efe0",
    ring: "#f1e7ca",
  },
  essentials: {
    from: "#6b3a2e",
    to: "#c17b52",
    ink: "#fdf0e2",
    ring: "#f1e7ca",
  },
  community: {
    from: "#2f5d6b",
    to: "#4c8a7a",
    ink: "#eef4f2",
    ring: "#f1e7ca",
  },
};

export function CoverArt({
  cover,
  className = "",
  showMonogram = true,
  emblemAside = false,
}: {
  cover: CoverArtData;
  className?: string;
  showMonogram?: boolean;
  /** Slide the funeral candle to the right so overlaid title text stays clear of it. */
  emblemAside?: boolean;
}) {
  const tone = TONES[cover.tone];
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 120% at 50% 30%, ${tone.to} 0%, ${tone.from} 100%)`,
      }}
      aria-hidden="true"
    >
      <Pattern tone={cover.tone} aside={emblemAside} />
      {/* The candle is the funeral emblem — a monogram on top of it just hides the flame. */}
      {showMonogram && cover.tone !== "funeral" && (
        <span
          className="relative font-display text-2xl font-semibold tracking-wide"
          style={{ color: tone.ink }}
        >
          {cover.monogram}
        </span>
      )}
    </div>
  );
}

function Pattern({ tone, aside }: { tone: CoverArtData["tone"]; aside: boolean }) {
  if (tone === "funeral") {
    return (
      <svg
        className={`absolute inset-0 h-full w-full ${aside ? "translate-x-[26%] lg:translate-x-[30%]" : ""}`}
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="mz-glow" cx="50%" cy="46%" r="52%">
            <stop offset="0%" stopColor="#f6c66b" stopOpacity="0.7" />
            <stop offset="55%" stopColor="#f6c66b" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#f6c66b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mz-dish" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f7df9f" />
            <stop offset="100%" stopColor="#a87b2c" />
          </linearGradient>
          <linearGradient id="mz-wax" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e9cf95" />
            <stop offset="45%" stopColor="#fdf3d8" />
            <stop offset="100%" stopColor="#d9bb78" />
          </linearGradient>
        </defs>
        <rect width="200" height="120" fill="url(#mz-glow)" />
        {/* dish */}
        <ellipse cx="100" cy="90" rx="34" ry="7.5" fill="url(#mz-dish)" />
        <ellipse cx="100" cy="87.5" rx="29" ry="5" fill="#f4d88f" opacity="0.95" />
        {/* candle */}
        <rect x="95.5" y="54" width="9" height="34" rx="2.5" fill="url(#mz-wax)" />
        {/* flame */}
        <path d="M100 34c6 7 6.5 13 0 18-6.5-5-6-11 0-18z" fill="#f6c66b" />
        <path d="M100 41c2.6 3.4 2.8 6.2 0 8.6-2.8-2.4-2.6-5.2 0-8.6z" fill="#fff4cf" />
      </svg>
    );
  }
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-25"
      viewBox="0 0 200 120"
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="30" cy="24" r="40" fill="#ffffff" fillOpacity="0.14" />
      <circle cx="176" cy="104" r="52" fill="#ffffff" fillOpacity="0.1" />
    </svg>
  );
}
