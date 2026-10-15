"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Logo } from "./Logo";
import { AuthControl } from "@/components/auth/AuthControl";
import { HeartIcon, HomeIcon, MapIcon, PlusIcon, UserIcon } from "@/components/ui/Icons";

const NAV = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/explore", label: "Explore", icon: MapIcon },
  { href: "/activity", label: "My circles", icon: HeartIcon, authOnly: true },
  { href: "/profile", label: "Account", icon: UserIcon, authOnly: true },
];

/** The persistent left-hand nav shown at `md` and above, replacing the
 *  bottom tab bar. White, with the current page as a near-black pill. */
export function Sidebar() {
  const pathname = usePathname();
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const visibleNav = NAV.filter((item) => !item.authOnly || signedIn);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface text-ink md:flex">
      <Link href="/" className="flex items-center gap-2.5 px-6 py-7">
        <Logo className="size-9" />
        <span className="text-2xl font-extrabold tracking-tight">MseeZee</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1.5 px-3">
        {visibleNav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-full px-4 py-3 text-[0.95rem] font-semibold transition-colors ${
                active
                  ? "bg-night text-on-night"
                  : "text-ink-soft hover:bg-surface-sunk hover:text-ink"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link
          href="/create"
          className="flex items-center justify-center gap-2 rounded-full bg-lime px-4 py-3.5 text-[0.95rem] font-bold text-on-lime transition-[filter,transform] hover:brightness-95 active:scale-[0.98]"
        >
          <PlusIcon className="size-5" />
          Start a circle
        </Link>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-line px-3 py-3">
        <AuthControl />
        <p className="px-3 text-xs text-ink-faint">Together, we uplift.</p>
      </div>
    </aside>
  );
}
