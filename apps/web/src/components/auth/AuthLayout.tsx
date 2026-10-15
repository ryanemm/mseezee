import { Logo } from "@/components/layout/Logo";

/**
 * Sign in, sign up and "what should we call you": a dark typographic brand
 * band with the form on a white sheet sliding over it (phones), or the two
 * side by side (desktop).
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

/** A typographic brand panel: the promise in large type, nothing drawn.
 *  Fixed colours — it reads the same in light and dark mode. */
function AuthHero() {
  return (
    <div className="relative overflow-hidden bg-[#151815] px-5 pb-16 pt-[calc(env(safe-area-inset-top)+1.75rem)] text-white md:flex md:h-[34rem] md:flex-col md:justify-between md:rounded-[32px] md:p-10 md:shadow-lift">
      {/* A faint lime glow in one corner — depth without decoration. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full md:size-[28rem]"
        style={{ background: "radial-gradient(closest-side, rgba(212, 242, 106, 0.22), transparent)" }}
      />

      <div className="relative flex items-center gap-2.5">
        <Logo className="size-9" />
        <span className="text-lg font-extrabold tracking-tight">MseeZee</span>
      </div>

      <div className="relative mt-10 md:mt-0">
        <p className="text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.045em] md:text-[3.1rem]">
          Close to home.
          <br />
          Close to <span className="text-[#d4f26a]">heart.</span>
        </p>
        <p className="mt-4 max-w-xs text-[0.98rem] leading-relaxed text-white/60 md:max-w-sm md:text-lg">
          The family next door, the funeral down the road, the street you share — support
          the people around you in seconds.
        </p>
      </div>

      <p className="relative hidden text-sm font-semibold text-white/40 md:block">
        Together, we uplift.
      </p>
    </div>
  );
}
