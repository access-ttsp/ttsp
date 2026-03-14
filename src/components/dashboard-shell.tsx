"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import type { ProjectListItem } from "@/components/nav-main";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { TeamWithRole } from "@/modules/teams/model";

interface DashboardShellProps {
  teams: TeamWithRole[];
  currentSlug: string;
  projects: ProjectListItem[];
  children: React.ReactNode;
}

export function DashboardShell({
  teams,
  currentSlug,
  projects,
  children,
}: DashboardShellProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <SidebarProvider>
      {mounted ? (
        <AppSidebar
          currentSlug={currentSlug}
          projects={projects}
          teams={teams}
        />
      ) : (
        <aside
          aria-hidden
          className="w-16 shrink-0 border-r bg-sidebar md:w-64"
        />
      )}
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
