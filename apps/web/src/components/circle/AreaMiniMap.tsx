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
    <div className="overflow-hidden rounded-3xl bg-surface-sunk">
      <div className="relative h-32">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 320 120"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <rect width="320" height="120" fill="#e4e3de" />
          <path d="M-10 70 Q 60 40 130 66 T 330 58" stroke="#ffffff" strokeWidth="10" fill="none" />
          <path d="M40 -10 Q 70 60 30 130" stroke="#ffffff" strokeWidth="8" fill="none" />
          <path d="M240 -10 L 262 130" stroke="#efe6c4" strokeWidth="9" fill="none" />
          <circle cx="180" cy="60" r="30" fill="#d4f26a" fillOpacity="0.6" />
          <circle cx="180" cy="60" r="8" fill="#151815" stroke="#ffffff" strokeWidth="3" />
        </svg>
        <span className="absolute bottom-2.5 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[0.7rem] font-semibold text-[#5b605b]">
          Approximate area · not an address
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
        <span className="font-bold text-ink">
          {section ? `${areaName} · ${section}` : areaName}
        </span>
        {supportersFromArea !== undefined && supportersFromArea > 0 && (
          <span className="text-ink-soft tnum">
            {supportersFromArea} local{" "}
            {supportersFromArea === 1 ? "supporter" : "supporters"}
          </span>
        )}
      </div>
    </div>
  );
}
