import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Loader2, ShieldCheck, Search } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FreelancerSidebar } from "@/components/freelancer/freelancer-sidebar";
import { useSessionUser, signOutAndClear } from "@/lib/use-session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyOnboarding } from "@/lib/onboarding.functions";
import { listMyNotifications, markAllNotificationsRead } from "@/lib/notifications.functions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSignedFileUrl } from "@/lib/use-signed-url";
import { FreelancerTour } from "@/components/freelancer/freelancer-tour";


export const Route = createFileRoute("/freelancer")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Talent Portal — Workvia" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FreelancerLayout,
});

function FreelancerLayout() {
  const { loading, signedIn, user } = useSessionUser();
  const qc = useQueryClient();
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
          <p className="mt-2 text-sm text-muted-foreground">Sign in to access your freelancer dashboard.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/login" search={{ redirect: "/freelancer" }} className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">Log in</Link>
            <Link to="/register" className="rounded-full border px-5 py-2.5 text-sm font-medium">Sign up</Link>
          </div>
        </div>
      </div>
    );
  }
  if (!user.roles.includes("freelancer")) {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="max-w-md text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-violet" />
          <h1 className="mt-4 font-display text-2xl">Freelancer access only</h1>
          <p className="mt-2 text-sm text-muted-foreground">This portal is for freelancers. Your account doesn't have a freelancer role.</p>
          <div className="mt-6">
            <Link to="/" className="rounded-full border px-5 py-2.5 text-sm font-medium">Back home</Link>
          </div>
        </div>
      </div>
    );
  }

  const name = user.profile?.full_name ?? user.email ?? "Freelancer";
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const avatar = user.profile?.avatar_url ?? null;
  return <FreelancerShell name={name} initials={initials} email={user.email ?? ""} avatar={avatar} qc={qc} navigate={navigate} />;
}

function FreelancerShell({ name, initials, email, avatar, qc, navigate }: { name: string; initials: string; email: string; avatar: string | null; qc: ReturnType<typeof useQueryClient>; navigate: ReturnType<typeof useNavigate> }) {
  const { data: onb } = useQuery({ queryKey: ["fl", "onboarding"], queryFn: () => getMyOnboarding() });
  const rawPhoto = avatar ?? onb?.data?.photoUrl ?? null;
  const { url: photo } = useSignedFileUrl(rawPhoto);

  const { data: notifs = [], refetch } = useQuery({
    queryKey: ["fl", "notifications"],
    queryFn: () => listMyNotifications(),
    refetchInterval: 60_000,
  });
  const unread = notifs.filter((n) => !n.readAt).length;
  const markRead = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => refetch(),
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <FreelancerSidebar user={{ name, email, initials }} />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <div className="relative hidden flex-1 max-w-md sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search jobs, contracts…" className="h-9 pl-9" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Popover onOpenChange={(o) => { if (o && unread > 0) markRead.mutate(); }}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                    <Bell className="h-4 w-4" />
                    {unread > 0 ? (
                      <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">{unread}</span>
                    ) : null}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="border-b px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notifications</div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">You're all caught up.</p>
                    ) : notifs.map((n) => (
                      <div key={n.id} className={`border-b px-3 py-2 text-sm ${!n.readAt ? "bg-violet/5" : ""}`}>
                        <p className="font-medium">{n.title}</p>
                        {n.body ? <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p> : null}
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {photo ? (
                <img src={photo} alt={name} className="h-8 w-8 rounded-full object-cover border" />
              ) : (
                <div className="grid h-8 w-8 place-items-center rounded-full bg-violet text-xs font-semibold text-white">{initials}</div>
              )}

              <Button variant="ghost" size="icon" aria-label="Sign out"
                onClick={async () => { await signOutAndClear(qc); navigate({ to: "/login" }); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1"><Outlet /></main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}