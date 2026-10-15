/**
 * The app's line icons, drawn inline so there's nothing to bundle or 404.
 * All take `className` for size and inherit `currentColor`.
 */

type IconProps = { className?: string; filled?: boolean };

function Svg({
  className = "size-5",
  children,
  fill = "none",
}: {
  className?: string;
  children: React.ReactNode;
  fill?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" fill={fill} className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

const stroke = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function BackIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m15 5-7 7 7 7" {...stroke} />
    </Svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 12h14m-6-6 6 6-6 6" {...stroke} />
    </Svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m9 5 7 7-7 7" {...stroke} />
    </Svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m5 9 7 7 7-7" {...stroke} />
    </Svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="11" cy="11" r="7" {...stroke} />
      <path d="m16.5 16.5 3.5 3.5" {...stroke} />
    </Svg>
  );
}

export function LocateIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="6.5" {...stroke} />
      <circle cx="12" cy="12" r="2.2" {...stroke} />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" {...stroke} />
    </Svg>
  );
}

export function PinIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 21c4.5-4.2 7-7.6 7-11a7 7 0 1 0-14 0c0 3.4 2.5 6.8 7 11z" {...stroke} />
      <circle cx="12" cy="10" r="2.4" {...stroke} />
    </Svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m5 12.5 4.5 4.5L19 7.5" {...stroke} strokeWidth={2.4} />
    </Svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 5v14M5 12h14" {...stroke} strokeWidth={2.2} />
    </Svg>
  );
}

export function HeartIcon({ className, filled }: IconProps) {
  return (
    <Svg className={className} fill={filled ? "currentColor" : "none"}>
      <path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.1a4.4 4.4 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z" {...stroke} />
    </Svg>
  );
}

export function ShareIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 15V3.5m0 0L7.5 8M12 3.5 16.5 8M5 12.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5" {...stroke} />
    </Svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.5H9v5.5H5.5A1.5 1.5 0 0 1 4 19z" {...stroke} />
    </Svg>
  );
}

export function MapIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m3.5 6.5 5.5-2.5 6 2.5 5.5-2.5v13.5L15 20l-6-2.5-5.5 2.5z" {...stroke} />
      <path d="M9 4v13.5M15 6.5V20" {...stroke} />
    </Svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="8.5" r="4" {...stroke} />
      <path d="M4.5 20.5c1-3.6 3.9-5.5 7.5-5.5s6.5 1.9 7.5 5.5" {...stroke} />
    </Svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" {...stroke} />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" {...stroke} />
    </Svg>
  );
}

export function BoltIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M13 3 5.5 13.5H12L11 21l7.5-10.5H12z" {...stroke} />
    </Svg>
  );
}

export function BankIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 9.5 12 5l8 4.5M5.5 10v7.5M9.5 10v7.5M14.5 10v7.5M18.5 10v7.5M3.5 20h17" {...stroke} />
    </Svg>
  );
}

export function CardIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" {...stroke} />
      <path d="M3 10h18M7 14.5h3" {...stroke} />
    </Svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" {...stroke} />
      <path d="M11 18h2" {...stroke} />
    </Svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" {...stroke} />
      <path d="m3.5 7 8.5 6 8.5-6" {...stroke} />
    </Svg>
  );
}

export function SignOutIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M14 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H14M10.5 12H21m-3.5-3.5L21 12l-3.5 3.5" {...stroke} />
    </Svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3.5 5 6v5.5c0 4.4 3 7.8 7 9 4-1.2 7-4.6 7-9V6z" {...stroke} />
      <path d="m9 12 2.2 2.2L15.5 10" {...stroke} />
    </Svg>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="2" {...stroke} />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="2" {...stroke} />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="2" {...stroke} />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" {...stroke} />
    </Svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8.5" {...stroke} />
      <path d="M12 7.5V12l3 2" {...stroke} />
    </Svg>
  );
}

export function EyeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" {...stroke} />
      <circle cx="12" cy="12" r="3" {...stroke} />
    </Svg>
  );
}

export function EyeOffIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M10 5.8A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.4M6.6 6.6C4 8.3 2.5 12 2.5 12S6 18.5 12 18.5a9 9 0 0 0 4.4-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2M3.5 3.5l17 17" {...stroke} />
    </Svg>
  );
}
