import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { TeamWithRole } from "@/modules/teams/model";

interface DashboardShellProps {
  teams: TeamWithRole[];
  currentSlug: string;
  children: React.ReactNode;
}

export function DashboardShell({
  teams,
  currentSlug,
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar currentSlug={currentSlug} teams={teams} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
