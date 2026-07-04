import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Briefcase, ClipboardList, FileText, Receipt, UserRound, ListChecks, Clock } from "lucide-react";
import logoAsset from "@/assets/workvia-logo.png.asset.json";
const logoUrl = logoAsset.url;
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";

const nav = [
  { title: "Overview",     url: "/freelancer",              icon: LayoutDashboard, exact: true, tour: "overview" },
  { title: "Onboarding",   url: "/freelancer/onboarding",   icon: ListChecks,      tour: "onboarding" },
  { title: "Find work",    url: "/freelancer/jobs",         icon: Briefcase,       tour: "jobs" },
  { title: "Applications", url: "/freelancer/applications", icon: ClipboardList,   tour: "applications" },
  { title: "Contracts",    url: "/freelancer/contracts",    icon: FileText,        tour: "contracts" },
  { title: "Timesheets",   url: "/freelancer/timesheets",   icon: Clock,           tour: "timesheets" },
  { title: "Earnings",     url: "/freelancer/earnings",     icon: Receipt,         tour: "earnings" },
  { title: "Profile",      url: "/freelancer/profile",      icon: UserRound,       tour: "profile" },
];

export function FreelancerSidebar({ user }: { user?: { name: string; email: string; initials: string } }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/freelancer" className="flex items-center gap-2 px-2 py-1.5">
          <img src={logoUrl} alt="Workvia" className="h-8 w-8 object-contain" />
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Workvia</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Talent Portal</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={active(item.url, item.exact)} tooltip={item.title}>
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
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-violet text-white text-xs font-semibold">{user?.initials ?? "FL"}</div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{user?.name ?? "Freelancer"}</span>
            <span className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}