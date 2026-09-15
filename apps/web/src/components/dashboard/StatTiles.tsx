export function StatTiles({
  items,
}: {
  items: { label: string; value: string; tone?: "ink" | "forest" | "gold" }[];
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex flex-col gap-0.5 rounded-card border border-line bg-surface p-3 text-center shadow-card"
        >
          <span
            className={`font-display text-lg tnum ${
              it.tone === "gold"
                ? "text-gold"
                : it.tone === "ink"
                  ? "text-ink"
                  : "text-forest"
            }`}
          >
            {it.value}
          </span>
          <span className="text-[0.6rem] font-medium uppercase tracking-wide text-ink-faint">
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}
