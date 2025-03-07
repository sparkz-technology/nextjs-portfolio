"use client";

import * as React from "react";
import {
  BookImage,
  Bot,
  ContactRound,
  Film,
  FlaskConical,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Notebook,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession() as { data: { user: { name?: string; email?: string; image?: string } } };
  const data = {
    user: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      avatar: session?.user?.image || "",
    },
    profile: {
      name: session?.user?.name || "",
      logo: session?.user?.image || "",
      plan: "Developer",
    },

    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "About",
        url: "/dashboard/about",
        icon: ContactRound,
      },
      {
        title: "Asset",
        url: "/dashboard/asset",
        icon: Film,
      },
      {
        title: "Project",
        url: "/dashboard/project",
        icon: FolderGit2,
        isActive: true,
      },
      {
        title: "Skill",
        url: "/dashboard/skill",
        icon: Bot,
      },
      {
        title: "Experience",
        url: "/dashboard/experience",
        icon: FlaskConical,
      },
      {
        title: "Guestbook",
        url: "/dashboard/guestbook",
        icon: BookImage,
      },
      {
        title: "Message",
        url: "/dashboard/message",
        icon: Mail,
      },
      {
        title: "Education",
        url: "/dashboard/education",
        icon: GraduationCap,
      },
      {
        title: "Blog",
        url: "/dashboard/blog",
        icon: Notebook,
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher profile={data.profile} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
