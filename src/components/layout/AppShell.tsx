import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="internal-shell min-h-screen bg-[#0A1830] text-white">
      <Sidebar />
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(30,155,240,0.12),transparent_32%),linear-gradient(135deg,#0A1830,#071326)] lg:pl-72">
        <Topbar />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
