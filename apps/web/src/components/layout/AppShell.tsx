import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

/**
 * Below `md`: full-bleed screens with a floating bottom tab bar — each page
 * draws its own header. At `md` and above: a persistent left sidebar, and each
 * page chooses its own content width.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div className="flex min-h-dvh flex-col md:pl-64">
        <main className="flex-1">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
