import type { CircleType } from "@mseezee/shared";
import { Logo } from "@/components/layout/Logo";
import { CircleEmblem } from "@/components/ui/CoverArt";

/**
 * Sign in, sign up and "what should we call you": an illustrated brand band
 * with the form on a white sheet sliding over it (phones), or the two side
 * by side (desktop).
 */
export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="md:mx-auto md:grid md:max-w-5xl md:grid-cols-2 md:items-center md:gap-12 md:px-10 md:py-12">
      <AuthHero />
      <div className="relative -mt-8 rounded-t-[32px] bg-surface px-5 pb-10 pt-8 shadow-sheet md:mt-0 md:rounded-none md:px-0 md:pt-0 md:shadow-none">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
          <header className="flex flex-col gap-1.5">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="text-[2.1rem] font-extrabold leading-[1.05] tracking-[-0.035em]">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-ink-soft">{subtitle}</p>}
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}

/** The four circle types, tilted like cards on a table. */
const TILES: { type: CircleType; tilt: string }[] = [
  { type: "funeral", tilt: "-rotate-6" },
  { type: "community", tilt: "translate-y-6 rotate-6" },
  { type: "essentials", tilt: "rotate-3" },
  { type: "family", tilt: "translate-y-6 -rotate-3" },
];

function AuthHero() {
  return (
    <div
      aria-hidden="true"
      className="relative h-64 overflow-hidden bg-[#1f4a34] pt-[env(safe-area-inset-top)] md:h-[34rem] md:rounded-[32px] md:shadow-lift"
    >
      {/* Lime sun with faint halo rings. */}
      <div className="absolute -right-20 -top-24 size-72 rounded-full bg-[#d4f26a] md:-right-24 md:-top-28 md:size-[26rem]" />
      <div className="absolute -right-32 -top-36 size-96 rounded-full border border-white/10 md:size-[34rem]" />
      <div className="absolute -right-44 -top-48 size-[30rem] rounded-full border border-white/10 md:size-[42rem]" />
      {/* Stars. */}
      <span className="absolute left-[12%] top-[18%] size-1.5 rounded-full bg-white/40" />
      <span className="absolute left-[34%] top-[10%] size-1 rounded-full bg-white/40" />
      <span className="absolute left-[46%] top-[34%] size-1.5 rounded-full bg-white/30" />
      <span className="absolute left-[22%] top-[42%] size-1 rounded-full bg-white/30" />

      <div className="absolute right-6 top-1/2 grid -translate-y-[62%] grid-cols-2 gap-3 md:right-10 md:-translate-y-1/2 md:gap-5">
        {TILES.map(({ type, tilt }) => (
          <span key={type} className={`block rounded-[22px] shadow-lift ring-4 ring-white/15 ${tilt}`}>
            <CircleEmblem type={type} className="size-16 rounded-[20px] md:size-28 md:rounded-[30px]" />
          </span>
        ))}
      </div>

      <div className="absolute bottom-12 left-5 md:bottom-10 md:left-10">
        <span className="mb-3 inline-flex rounded-full ring-2 ring-white/30">
          <Logo className="size-11 md:size-14" />
        </span>
        <p className="text-[1.75rem] font-extrabold leading-none tracking-tight text-white md:text-[2.4rem]">
          MseeZee
        </p>
        <p className="mt-1.5 text-white/75 md:text-lg">Together, we uplift.</p>
      </div>
    </div>
  );
}
