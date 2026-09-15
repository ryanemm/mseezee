import Link from "next/link";

export function Placeholder({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-forest/10 text-forest">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M12 7v5l3 2"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h1 className="text-xl">{title}</h1>
      <p className="max-w-xs text-sm text-ink-soft">{body}</p>
      <Link href="/" className="pt-1 text-sm font-semibold text-forest">
        Back to home
      </Link>
    </div>
  );
}
