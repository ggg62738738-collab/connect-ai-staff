import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Briefcase, ClipboardList, FileText, Wallet } from "lucide-react";
import { getFreelancerMetrics, listMyApplications, listOpenJobs } from "@/lib/freelancer.functions";
import { fmtMoney } from "@/lib/admin-data";

export const Route = createFileRoute("/freelancer/")({ component: Overview });

function Overview() {
  const { data: m } = useQuery({ queryKey: ["fl", "metrics"], queryFn: () => getFreelancerMetrics() });
  const { data: jobs = [] } = useQuery({ queryKey: ["fl", "open-jobs"], queryFn: () => listOpenJobs() });
  const { data: apps = [] } = useQuery({ queryKey: ["fl", "my-applications"], queryFn: () => listMyApplications() });

  return (
    <>
      <PageHeader title="Welcome back" subtitle="Your freelance workspace at a glance." />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Open applications" value={String(m?.activeApplications ?? 0)} icon={ClipboardList} />
          <StatCard label="Active contracts" value={String(m?.activeContracts ?? 0)} icon={FileText} />
          <StatCard label="Earned (paid)" value={fmtMoney(m?.earnings ?? 0)} icon={Wallet} />
          <StatCard label="Pending payouts" value={fmtMoney(m?.pendingPayouts ?? 0)} icon={Wallet} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent applications</CardTitle>
              <Link to="/freelancer/applications" className="text-xs text-violet">View all →</Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {apps.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{a.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">{a.company} · {a.submittedAt}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">{a.stage}</Badge>
                </div>
              ))}
              {apps.length === 0 ? (
                <Link to="/freelancer/jobs" className="block rounded-md border border-dashed py-6 text-center text-xs text-violet">Browse open roles →</Link>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-4 w-4" /> Recommended for you</CardTitle>
              <Link to="/freelancer/jobs" className="text-xs text-violet">View all →</Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {jobs.slice(0, 5).map((j) => (
                <div key={j.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{j.title}</p>
                    <p className="text-xs text-muted-foreground">{j.company} · {j.type}</p>
                  </div>
                  <span className="text-sm font-semibold">{fmtMoney(j.budget)}</span>
                </div>
              ))}
              {jobs.length === 0 ? <p className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">No open jobs yet</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}