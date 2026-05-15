import Sidebar, { SidebarType } from "./Sidebar";
import Topbar from "./Topbar";
import CopilotBar from "@/components/CopilotBar";

interface AppShellProps {
  type: SidebarType;
  children: React.ReactNode;
}

export default function AppShell({ type, children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F8F7]">
      <Sidebar type={type} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <CopilotBar />
    </div>
  );
}
