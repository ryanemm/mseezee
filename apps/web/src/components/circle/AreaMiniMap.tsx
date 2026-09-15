/**
 * A stylised area marker — deliberately NOT a real map with a precise pin.
 * Public circle pages show locality, never a household. Funeral circles in
 * particular must never advertise an address next to a running total.
 */
export function AreaMiniMap({
  areaName,
  section,
  supportersFromArea,
}: {
  areaName: string;
  section?: string;
  supportersFromArea?: number;
}) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="relative h-28 bg-surface-sunk">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 320 120"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <rect width="320" height="120" fill="var(--surface-sunk)" />
          <path
            d="M-10 70 Q 60 40 130 66 T 330 58"
            stroke="var(--line)"
            strokeWidth="10"
            fill="none"
          />
          <path
            d="M40 -10 Q 70 60 30 130"
            stroke="var(--line)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="180"
            cy="60"
            r="34"
            fill="var(--forest)"
            fillOpacity="0.12"
          />
          <circle
            cx="180"
            cy="60"
            r="20"
            fill="var(--forest)"
            fillOpacity="0.18"
          />
          <circle cx="180" cy="60" r="7" fill="var(--forest)" />
        </svg>
        <span className="absolute bottom-2 left-3 rounded-full bg-surface/90 px-2 py-0.5 text-[0.66rem] font-medium text-ink-soft">
          Approximate area · not an address
        </span>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="font-semibold text-ink">
          {section ? `${areaName} · ${section}` : areaName}
        </span>
        {supportersFromArea !== undefined && supportersFromArea > 0 && (
          <span className="text-ink-faint tnum">
            {supportersFromArea} local{" "}
            {supportersFromArea === 1 ? "supporter" : "supporters"}
          </span>
        )}
      </div>
    </div>
  );
}
