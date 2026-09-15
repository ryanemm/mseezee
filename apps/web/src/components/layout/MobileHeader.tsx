import Link from "next/link";
import { Logo } from "./Logo";
import { AuthControl } from "@/components/auth/AuthControl";

/** The compact top bar shown below the `md` breakpoint. Desktop gets the
 *  sidebar's branding instead — see `Sidebar.tsx`. */
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line/70 bg-paper/85 px-4 py-3 backdrop-blur md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <Logo />
        <span className="font-display text-lg font-semibold tracking-tight text-forest">
          MseeZee
        </span>
      </Link>
      <AuthControl compact />
    </header>
  );
}
