import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { BottomNav } from "./BottomNav";

/**
 * Below `md`: a mobile app shell — sticky header, bottom tab bar.
 * At `md` and above: a persistent left sidebar, no phone-width cap — each
 * page chooses its own content width instead of being boxed into one.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div className="flex min-h-dvh flex-col md:pl-64">
        <MobileHeader />
        <main className="flex-1 pb-32 md:pb-0">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
