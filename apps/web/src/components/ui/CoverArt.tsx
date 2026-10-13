import type { CircleType, CoverArt as CoverArtData } from "@mseezee/shared";

/**
 * Generated cover art — one flat illustration per circle type, so no circle
 * ever needs an uploaded photo. The colours are fixed (not theme tokens):
 * they're artwork, and read the same in light and dark mode.
 */

export const COVER_BG: Record<CircleType, string> = {
  community: "#1f4a34",
  funeral: "#3b2a20",
  essentials: "#4a3657",
  family: "#8a4630",
};

const LIME = "#d4f26a";

export function CoverArt({
  cover,
  className = "",
}: {
  cover: CoverArtData;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ background: COVER_BG[cover.tone] }}
      aria-hidden="true"
    >
      <svg
        className="block h-full w-full"
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="400" height="240" fill={COVER_BG[cover.tone]} />
        <Stars />
        {cover.tone === "community" && <CommunityScene />}
        {cover.tone === "funeral" && <FuneralScene />}
        {cover.tone === "essentials" && <EssentialsScene />}
        {cover.tone === "family" && <FamilyScene />}
      </svg>
    </div>
  );
}

function Stars() {
  return (
    <g fill="#ffffff" opacity="0.35">
      <circle cx="42" cy="34" r="2" />
      <circle cx="128" cy="22" r="1.6" />
      <circle cx="196" cy="52" r="2" />
      <circle cx="244" cy="20" r="1.6" />
      <circle cx="372" cy="38" r="2" />
      <circle cx="168" cy="96" r="1.4" />
    </g>
  );
}

function house(x: number, w: number, wallTop: number, peak: number, base = 160) {
  return `M${x} ${base}V${wallTop}L${x + w / 2} ${peak}L${x + w} ${wallTop}V${base}Z`;
}

/** Street lamps over a row of houses, a road, and a lime sun. */
function CommunityScene() {
  return (
    <g>
      <circle cx="318" cy="150" r="66" fill={LIME} />
      <polygon points="104,72 128,72 172,206 58,206" fill={LIME} opacity="0.07" />
      <polygon points="284,82 308,82 352,206 246,206" fill="#ffffff" opacity="0.06" />
      <g fill="#173b2a">
        <path d={house(-6, 58, 126, 106)} />
        <path d={house(58, 46, 132, 116)} />
        <path d={house(116, 62, 124, 100)} />
        <path d={house(186, 40, 136, 122)} />
        <path d={house(240, 56, 130, 110)} />
        <path d={house(302, 50, 134, 116)} />
        <path d={house(358, 60, 128, 108)} />
      </g>
      <g fill={LIME} opacity="0.55">
        <rect x="18" y="138" width="8" height="8" rx="2" />
        <rect x="142" y="134" width="8" height="8" rx="2" />
        <rect x="372" y="140" width="8" height="8" rx="2" />
      </g>
      <rect y="160" width="400" height="80" fill="#12301f" />
      <rect x="252" y="160" width="148" height="20" fill={LIME} />
      <polygon points="172,240 228,240 204,160 196,160" fill="#0b2216" />
      <g fill="#3f6b55">
        <rect x="198.5" y="168" width="3" height="8" rx="1.5" />
        <rect x="198" y="186" width="4" height="11" rx="2" />
        <rect x="197.5" y="208" width="5" height="16" rx="2.5" />
      </g>
      <Lamp poleX={92} headX={106} top={64} />
      <Lamp poleX={326} headX={282} top={74} flip />
    </g>
  );
}

function Lamp({
  poleX,
  headX,
  top,
  flip = false,
}: {
  poleX: number;
  headX: number;
  top: number;
  flip?: boolean;
}) {
  const bend = flip ? -16 : 16;
  return (
    <g>
      <circle cx={headX + 13} cy={top + 4} r="25" fill="#7fa37a" opacity="0.5" />
      <path
        d={`M${poleX} 240V${top + 16}Q${poleX} ${top} ${poleX + bend} ${top}`}
        stroke="#3f6b55"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <rect x={headX} y={top - 4} width="26" height="10" rx="5" fill="#eef3e6" />
    </g>
  );
}

/** A lit candle on a dish, glowing on low hills. */
function FuneralScene() {
  return (
    <g>
      <g fill="#f6c66b">
        <circle cx="270" cy="112" r="112" opacity="0.06" />
        <circle cx="270" cy="112" r="74" opacity="0.08" />
        <circle cx="270" cy="112" r="44" opacity="0.12" />
      </g>
      <path d="M0 192Q100 162 200 184T400 174V240H0Z" fill="#2c1f17" />
      <g transform="translate(50 -2) scale(2.2)">
        <ellipse cx="100" cy="90" rx="34" ry="7.5" fill="#a87b2c" />
        <ellipse cx="100" cy="87.5" rx="29" ry="5" fill="#f4d88f" />
        <rect x="95.5" y="54" width="9" height="34" rx="2.5" fill="#fdf3d8" />
        <rect x="101" y="54" width="3.5" height="34" rx="1.5" fill="#d9bb78" opacity="0.7" />
        <path d="M100 34c6 7 6.5 13 0 18-6.5-5-6-11 0-18z" fill="#f6c66b" />
        <path d="M100 41c2.6 3.4 2.8 6.2 0 8.6-2.8-2.4-2.6-5.2 0-8.6z" fill="#fff4cf" />
      </g>
    </g>
  );
}

/** A wrapped pack with a lime ribbon, and a second parcel behind it. */
function EssentialsScene() {
  return (
    <g>
      <circle cx="282" cy="118" r="90" fill="#5a4468" />
      <rect y="200" width="400" height="40" fill="#3d2c48" />
      <rect x="304" y="124" width="60" height="76" rx="7" fill={LIME} />
      <rect x="298" y="112" width="72" height="16" rx="5" fill="#c4e35a" />
      <rect x="214" y="116" width="104" height="84" rx="8" fill="#f3e8f1" />
      <rect x="206" y="100" width="120" height="24" rx="6" fill="#fbf5fa" />
      <rect x="258" y="100" width="16" height="100" fill={LIME} />
      <path d="M266 100c-14-18-36-13-29 0 4 8 19 6 29 0z" fill={LIME} />
      <path d="M266 100c14-18 36-13 29 0-4 8-19 6-29 0z" fill={LIME} />
      <g fill="#ffffff" opacity="0.5">
        <circle cx="120" cy="150" r="3" />
        <circle cx="96" cy="182" r="2" />
        <circle cx="160" cy="70" r="2.5" />
      </g>
    </g>
  );
}

/** A home with a lime heart over the roof. */
function FamilyScene() {
  return (
    <g>
      <circle cx="292" cy="150" r="74" fill="#9e5638" />
      <path d="M0 200Q120 176 240 196T400 188V240H0Z" fill="#6f3524" />
      <rect x="236" y="132" width="96" height="72" fill="#f6e7da" />
      <path d="M224 138 284 92l60 46z" fill="#fff3e8" />
      <rect x="274" y="166" width="20" height="38" rx="3" fill="#8a4630" />
      <rect x="248" y="148" width="18" height="16" rx="3" fill={LIME} />
      <rect x="302" y="148" width="18" height="16" rx="3" fill={LIME} />
      <path d="M284 86c-9-6.5-14-11-14-16.5a7 7 0 0 1 14-2.5 7 7 0 0 1 14 2.5c0 5.5-5 10-14 16.5z" fill={LIME} />
    </g>
  );
}

/** The small square badge for lists and tiles — the same idea as the cover,
 *  reduced to one emblem. */
export function CircleEmblem({
  type,
  className = "size-14 rounded-2xl",
}: {
  type: CircleType;
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden ${className}`}
      style={{ background: COVER_BG[type] }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" className="h-[70%] w-[70%]">
        {type === "community" && (
          <g>
            <circle cx="31" cy="15" r="9" fill="#7fa37a" opacity="0.7" />
            <path d="M16 44V17q0-7 7-7h2" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x="23" y="11" width="15" height="6" rx="3" fill="#ffffff" />
          </g>
        )}
        {type === "funeral" && (
          <g>
            <circle cx="24" cy="18" r="11" fill="#f6c66b" opacity="0.18" />
            <path d="M24 8c4 4.6 4.3 8.6 0 12-4.3-3.4-4-7.4 0-12z" fill="#f6c66b" />
            <rect x="19.5" y="23" width="9" height="19" rx="2.5" fill="#fdf3d8" />
          </g>
        )}
        {type === "essentials" && (
          <g>
            <rect x="10" y="20" width="28" height="22" rx="3" fill="#f3e8f1" />
            <rect x="7" y="14" width="34" height="9" rx="3" fill="#fbf5fa" />
            <rect x="21" y="14" width="6" height="28" fill={LIME} />
            <path d="M24 14c-5-7-12-5-9.5 0 1.5 3 6 2 9.5 0zM24 14c5-7 12-5 9.5 0-1.5 3-6 2-9.5 0z" fill={LIME} />
          </g>
        )}
        {type === "family" && (
          <g>
            <path d="M24 13c-4-3-7-5.5-7-8a3.5 3.5 0 0 1 7-1.5A3.5 3.5 0 0 1 31 5c0 2.5-3 5-7 8z" fill={LIME} />
            <path d="M8 27 24 15l16 12z" fill="#fff3e8" />
            <rect x="11" y="26" width="26" height="17" fill="#f6e7da" />
            <rect x="21" y="32" width="6" height="11" rx="1.5" fill="#8a4630" />
          </g>
        )}
      </svg>
    </span>
  );
}
