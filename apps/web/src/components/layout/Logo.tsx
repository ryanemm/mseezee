export function Logo({ className = "size-[26px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 26 26" className={className} aria-hidden="true">
      <circle cx="13" cy="13" r="12.5" fill="var(--forest)" />
      <circle cx="9.5" cy="10" r="2.6" fill="var(--gold-line)" />
      <circle cx="16.5" cy="11.5" r="2.6" fill="#fffdf7" />
      <path
        d="M6 19c1.6-3 4-4.5 7-4.5s5.4 1.5 7 4.5"
        stroke="#fffdf7"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
