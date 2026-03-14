"use client";

import {
  BookOpen,
  Bot,
  Folder,
  LayoutDashboard,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import type { ProjectListItem } from "@/modules/projects/model";
import type { TeamWithRole } from "@/modules/teams/model";

// This is sample data for nav items.
const data = {
  navMain: [
    {
      title: "Projects",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  teams: TeamWithRole[];
  currentSlug: string;
  projects: ProjectListItem[];
}

export function AppSidebar({
  teams,
  currentSlug,
  projects,
  ...props
}: AppSidebarProps) {
  const { data: session } = useSession();

  const user = {
    name: session?.user?.name ?? "User",
    email: session?.user?.email ?? "",
    avatar: session?.user?.image ?? "",
  };

  const projectsList = [
    { name: "Dashboard", url: `/${currentSlug}`, icon: LayoutDashboard },
    ...projects.map((p) => ({
      name: p.title,
      url: `/${currentSlug}/projects/${p.id}`,
      icon: Folder,
    })),
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher currentSlug={currentSlug} teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          currentSlug={currentSlug}
          items={data.navMain}
          projects={projects}
        />
        <NavProjects projects={projectsList} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
