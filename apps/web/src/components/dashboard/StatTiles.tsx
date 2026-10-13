const TONES = {
  forest: "bg-lime text-on-lime",
  gold: "bg-surface text-ink",
  ink: "bg-night text-on-night",
};

export function StatTiles({
  items,
}: {
  items: { label: string; value: string; tone?: keyof typeof TONES }[];
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {items.map((it) => (
        <div
          key={it.label}
          className={`flex flex-col gap-1 rounded-3xl p-4 shadow-card ${TONES[it.tone ?? "forest"]}`}
        >
          <span className="text-[1.35rem] font-extrabold leading-tight tracking-tight tnum">
            {it.value}
          </span>
          <span className="text-[0.72rem] font-semibold uppercase tracking-wide opacity-70">
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}
