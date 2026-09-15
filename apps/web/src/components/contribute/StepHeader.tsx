import Link from "next/link";

export function StepHeader({
  backHref,
  step,
  total,
  title,
}: {
  backHref: string;
  step: number;
  total: number;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3 px-4 pt-4">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-full border border-line text-ink-soft"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m15 5-7 7 7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <div className="flex flex-1 gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < step ? "bg-forest" : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>
      <h1 className="text-xl">{title}</h1>
    </div>
  );
}
