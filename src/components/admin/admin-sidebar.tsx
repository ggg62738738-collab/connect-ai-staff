import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Building2, Briefcase, FileText, Receipt,
  ClipboardList, Settings, Clock,
} from "lucide-react";
import logoAsset from "@/assets/workvia-logo.png.asset.json";
const logoUrl = logoAsset.url;
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const nav = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Talents", url: "/admin/freelancers", icon: Users },
  { title: "Companies", url: "/admin/companies", icon: Building2 },
  { title: "Jobs", url: "/admin/jobs", icon: Briefcase },
  { title: "Applications", url: "/admin/applications", icon: ClipboardList },
  { title: "Contracts", url: "/admin/contracts", icon: FileText },
  { title: "Timesheets", url: "/admin/timesheets", icon: Clock },
  { title: "Payments", url: "/admin/payments", icon: Receipt },
];

export function AdminSidebar({ user }: { user?: { name: string; email: string; initials: string } }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/admin" className="flex items-center gap-2 px-2 py-1.5">
          <img src={logoUrl} alt="Workvia" className="h-8 w-8 object-contain" />
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Workvia</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin Portal</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/settings")} tooltip="Settings">
                  <Link to="/admin/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-violet text-white text-xs font-semibold">{user?.initials ?? "AD"}</div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{user?.name ?? "Admin"}</span>
            <span className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}