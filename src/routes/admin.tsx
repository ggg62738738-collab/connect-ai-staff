import { createFileRoute, Outlet, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Bell, Search, LogOut, Loader2, ShieldCheck } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useSessionUser, signOutAndClear } from "@/lib/use-session";
import { useQueryClient } from "@tanstack/react-query";
import { claimAdminIfFirst } from "@/lib/auth.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Portal — Talentora" },
      { name: "description", content: "Operate the Talentora talent network — freelancers, companies, jobs, contracts, and payments in one place." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { loading, signedIn, user } = useSessionUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">
        <div className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      </div>
    );
  }

  if (!signedIn || !user) {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl">Sign in required</h1>
          <p className="mt-2 text-sm text-muted-foreground">The admin portal is restricted. Please sign in with an admin or recruiter account.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/login" search={{ redirect: "/admin" }} className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">Log in</Link>
            <Link to="/" className="rounded-full border px-5 py-2.5 text-sm font-medium">Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const isStaff = user.roles.includes("admin") || user.roles.includes("recruiter");
  if (!isStaff) {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="max-w-md text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-violet" />
          <h1 className="mt-4 font-display text-2xl">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account doesn't have admin or recruiter access. If you're bootstrapping this platform, claim the first admin role below.
          </p>
          <div className="mt-6 flex flex-col items-center gap-2">
            <Button
              onClick={async () => {
                try {
                  const res = await claimAdminIfFirst();
                  if (res.granted) {
                    toast.success("You're the first admin — welcome!");
                    await queryClient.invalidateQueries({ queryKey: ["session", "me"] });
                  } else {
                    toast.error("An admin already exists. Ask them to grant access.");
                  }
                } catch (e: any) {
                  toast.error(e?.message ?? "Could not claim admin");
                }
              }}
            >
              Claim first admin role
            </Button>
            <button
              onClick={async () => { await signOutAndClear(queryClient); navigate({ to: "/login" }); }}
              className="text-xs text-muted-foreground underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user.profile?.full_name ?? user.email ?? "Admin";
  const initials = displayName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar user={{ name: displayName, email: user.email ?? "", initials }} />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <div className="relative hidden flex-1 max-w-md sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search freelancers, companies, jobs…" className="h-9 pl-9" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="grid h-8 w-8 place-items-center rounded-full bg-violet text-xs font-semibold text-white">{initials}</div>
              <Button
                variant="ghost" size="icon" aria-label="Sign out"
                onClick={async () => { await signOutAndClear(queryClient); navigate({ to: "/login" }); }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}