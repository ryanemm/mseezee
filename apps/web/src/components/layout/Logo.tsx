/**
 * The MseeZee mark: two neighbouring houses that also form an M, inside a
 * ring, with one lit lime window. The ring and houses take `currentColor`, so
 * the mark follows the text colour around it (near-black on light surfaces,
 * light in dark mode and on the dark sign-in panel). The same drawing, on a
 * white disc, is the favicon — see `app/icon.svg`.
 */
export function Logo({ className = "size-[26px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="43.5" fill="none" stroke="currentColor" strokeWidth="9" />
      <LogoHouses />
    </svg>
  );
}

/** The houses, roofs and window — shared with the favicon. */
function LogoHouses() {
  return (
    <g transform="translate(50 50) scale(0.94) translate(-50 -48.5)">
      <g fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        {/* Left house — its cut-away inner corner is the M's diagonal. */}
        <path d="M22.2 72.9V48.2l14.1-14.1 6.3 6.3v20.9l-7.5-7.5v19.1z" />
        {/* Right house. */}
        <path d="M46 73V48.5l16-16 16 16V73z" />
      </g>
      {/* One continuous roofline over both houses: the M's outline. */}
      <path
        d="M17 47.1 36.3 27.8l12.05 12.05L62 26.2l21 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="56.5" y="49" width="11" height="11" rx="1.6" fill="#d4f26a" />
    </g>
  );
}
