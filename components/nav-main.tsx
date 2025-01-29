"use client";

import { type LucideIcon } from "lucide-react";
import { createElement } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  const handleToggleSidebar = () => isMobile && toggleSidebar();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) =>
          Array.isArray(item.items) ? (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <Link passHref href={item.url} onClick={handleToggleSidebar}>
                    <SidebarMenuButton tooltip={item.title} isActive={pathname === item.url}>
                      {item.icon && createElement(item.icon)}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <Link passHref href={item.url} onClick={handleToggleSidebar}>
                <SidebarMenuButton tooltip={item.title} isActive={pathname === item.url}>
                  {item.icon && createElement(item.icon)}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
