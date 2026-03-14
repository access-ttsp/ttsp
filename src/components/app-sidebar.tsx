"use client";

import { Bot, LayoutDashboard, Settings2, SquareTerminal } from "lucide-react";
import type * as React from "react";
import { NavLinks } from "@/components/nav-links";
import { NavMain } from "@/components/nav-main";
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
      title: "My",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Notifcations",
          url: "#",
        },
        {
          title: "Issues",
          url: "#",
        },
      ],
    },
    {
      title: "Projects",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [],
    },
    {
      title: "Team Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Projects",
          url: "#",
        },
        {
          title: "Members",
          url: "#",
        },

        {
          title: "My Profile",
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

  const linksItems = [
    { title: "Dashboard", url: `/${currentSlug}`, icon: LayoutDashboard },
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
        <NavLinks items={linksItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
