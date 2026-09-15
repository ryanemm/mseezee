import type { CoverArt as CoverArtData } from "@mseezee/shared";

const TONES: Record<
  CoverArtData["tone"],
  { from: string; to: string; ink: string; ring: string }
> = {
  funeral: {
    from: "#2b241d",
    to: "#4a3d2f",
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
}: {
  cover: CoverArtData;
  className?: string;
  showMonogram?: boolean;
}) {
  const tone = TONES[cover.tone];
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 120% at 20% 0%, ${tone.from} 0%, ${tone.to} 100%)`,
      }}
      aria-hidden="true"
    >
      <Pattern tone={cover.tone} />
      {showMonogram && (
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

function Pattern({ tone }: { tone: CoverArtData["tone"] }) {
  if (tone === "funeral") {
    return (
      <svg
        className="absolute inset-0 h-full w-full opacity-70"
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="glow" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#f6c66b" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f6c66b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="200" height="120" fill="url(#glow)" />
        <line x1="100" y1="52" x2="100" y2="86" stroke="#f6f0e0" strokeWidth="3" />
        <path
          d="M100 40c4 5 4 9 0 12-4-3-4-7 0-12z"
          fill="#f6c66b"
        />
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
