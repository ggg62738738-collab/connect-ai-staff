import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { Briefcase, Building2, DollarSign, TrendingUp, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminApi, fmtMoney } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const metrics = useQuery({ queryKey: ["admin", "metrics"], queryFn: adminApi.metrics });
  const series = useQuery({ queryKey: ["admin", "revenue"], queryFn: adminApi.revenueSeries });
  const pipeline = useQuery({ queryKey: ["admin", "pipeline"], queryFn: adminApi.pipeline });
  const activity = useQuery({ queryKey: ["admin", "activity"], queryFn: adminApi.activity });

  const m = metrics.data;
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Real-time signal across the entire Talentora network."
        actions={
          <>
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm">New invitation</Button>
          </>
        }
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Revenue (MTD)" value={m ? fmtMoney(m.revenue) : "—"} delta={m?.revenueDelta} icon={DollarSign} />
          <StatCard label="Active freelancers" value={m ? String(m.activeFreelancers) : "—"} delta={m?.activeFreelancersDelta} icon={Users} />
          <StatCard label="Active companies" value={m ? String(m.activeCompanies) : "—"} delta={m?.activeCompaniesDelta} icon={Building2} />
          <StatCard label="Open jobs" value={m ? String(m.openJobs) : "—"} delta={m?.openJobsDelta} icon={Briefcase} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revenue & placements</CardTitle>
                <p className="text-xs text-muted-foreground">Last 6 months</p>
              </div>
              <Badge variant="secondary" className="gap-1"><TrendingUp className="h-3 w-3" /> +12.4%</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series.data ?? []} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => fmtMoney(v)} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                    <Area type="monotone" dataKey="revenue" stroke="var(--violet)" fill="url(#rev)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hiring pipeline</CardTitle>
              <p className="text-xs text-muted-foreground">Across all open roles</p>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipeline.data ?? []} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="stage" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                    <Bar dataKey="count" fill="var(--violet)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Fill rate</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <p className="font-display text-4xl">{m?.fillRate ?? 0}%</p>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">+6%</Badge>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-violet" style={{ width: `${m?.fillRate ?? 0}%` }} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Of all open roles in the last 30 days.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Avg. time to hire</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-muted-foreground" />
                <p className="font-display text-4xl">{m?.avgTimeToHire ?? 0}d</p>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Application → signed contract, blended across roles.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Placements (YTD)</CardTitle></CardHeader>
            <CardContent>
              <p className="font-display text-4xl">{m?.placements ?? 0}</p>
              <p className="mt-3 text-xs text-muted-foreground">Successful matches resulting in active contracts.</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y">
              {(activity.data ?? []).map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <span className={
                    "inline-block h-2 w-2 rounded-full " +
                    (a.tone === "success" ? "bg-emerald-500" : a.tone === "warning" ? "bg-amber-500" : "bg-violet")
                  } />
                  <p className="flex-1 text-sm">
                    <span className="font-medium">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.what}</span>
                  </p>
                  <span className="text-xs text-muted-foreground">{a.when}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}