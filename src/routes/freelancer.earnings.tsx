import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/page-header";
import { listMyPayouts, getFreelancerMetrics } from "@/lib/freelancer.functions";
import { fmtMoney } from "@/lib/admin-data";
import { Loader2, Wallet, Clock, CheckCircle2, XCircle, TrendingUp, Download, Search, Receipt } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/freelancer/earnings")({ component: EarningsPage });

function EarningsPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ["fl", "my-payouts"], queryFn: () => listMyPayouts() });
  const { data: metrics } = useQuery({ queryKey: ["fl", "metrics"], queryFn: () => getFreelancerMetrics() });
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "paid" | "pending" | "failed">("all");

  const totals = useMemo(() => {
    const paid = data.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
    const pending = data.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
    const failed = data.filter(p => p.status === "failed").reduce((s, p) => s + p.amount, 0);
    return { paid, pending, failed, count: data.length };
  }, [data]);

  const chartData = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const p of data) {
      if (p.status !== "paid" || !p.date) continue;
      const key = p.date.slice(0, 7); // yyyy-mm
      byMonth.set(key, (byMonth.get(key) ?? 0) + p.amount);
    }
    // last 6 months window
    const now = new Date();
    const arr: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-IN", { month: "short" });
      arr.push({ month: label, amount: byMonth.get(key) ?? 0 });
    }
    return arr;
  }, [data]);

  const rows = useMemo(() => {
    return data.filter(p => (tab === "all" || p.status === tab) && (q === "" || p.invoice.toLowerCase().includes(q.toLowerCase())));
  }, [data, tab, q]);

  const avg = totals.count ? totals.paid / Math.max(data.filter(p => p.status === "paid").length, 1) : 0;

  return (
    <>
      <PageHeader
        title="Earnings"
        subtitle="Track your payouts, invoices, and cash flow."
        actions={<Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Export CSV</Button>}
      />
      <div className="space-y-5 p-4 sm:p-6">
        {/* KPI cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={<Wallet className="h-4 w-4" />} label="Lifetime earned" value={fmtMoney(totals.paid)} tone="bg-violet/10 text-violet" hint={`${data.filter(p=>p.status==="paid").length} invoices paid`} />
          <Kpi icon={<Clock className="h-4 w-4" />} label="Pending" value={fmtMoney(totals.pending)} tone="bg-amber-100 text-amber-700" hint="Awaiting release" />
          <Kpi icon={<TrendingUp className="h-4 w-4" />} label="Avg invoice" value={fmtMoney(Math.round(avg))} tone="bg-emerald-100 text-emerald-700" hint="Across paid invoices" />
          <Kpi icon={<Receipt className="h-4 w-4" />} label="Active contracts" value={String(metrics?.activeContracts ?? 0)} tone="bg-sky-100 text-sky-700" hint="Ongoing engagements" />
        </div>

        {/* Chart */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Earnings over time</CardTitle>
            <span className="text-xs text-muted-foreground">Last 6 months · paid</span>
          </CardHeader>
          <CardContent className="h-56 pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 8, right: 12, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--violet, 262 60% 52%))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--violet, 262 60% 52%))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="month" stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} className="text-muted-foreground" />
                <YAxis stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} className="text-muted-foreground" tickFormatter={(v) => `₹${Math.round(v/1000)}k`} width={48} />
                <Tooltip formatter={(v: any) => fmtMoney(Number(v))} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                <Area type="monotone" dataKey="amount" stroke="hsl(var(--violet, 262 60% 52%))" strokeWidth={2} fill="url(#earn)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm">Invoices & payouts</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="inline-flex rounded-md border p-0.5 text-xs">
                {(["all", "paid", "pending", "failed"] as const).map((k) => (
                  <button key={k}
                    onClick={() => setTab(k)}
                    className={`rounded px-3 py-1 capitalize transition ${tab === k ? "bg-violet text-white" : "text-muted-foreground hover:text-foreground"}`}>
                    {k}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoice…" className="h-8 w-full pl-8 text-xs sm:w-56" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-violet/10 text-violet"><Receipt className="h-5 w-5" /></div>
                <p className="text-sm font-medium">No payouts yet</p>
                <p className="max-w-xs text-xs text-muted-foreground">Once your first contract wraps up, invoices and payouts show up here.</p>
              </div>
            ) : (
              <ul className="divide-y">
                {rows.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusIcon status={p.status} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{p.invoice}</p>
                        <p className="text-xs text-muted-foreground">{p.date || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{fmtMoney(p.amount)}</span>
                      <Badge variant="outline" className={"capitalize " + statusTone(p.status)}>{p.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Kpi({ icon, label, value, hint, tone }: { icon: React.ReactNode; label: string; value: string; hint?: string; tone: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className={`grid h-7 w-7 place-items-center rounded-md ${tone}`}>{icon}</div>
        </div>
        <p className="mt-2 font-display text-2xl">{value}</p>
        {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: "paid" | "pending" | "failed" }) {
  if (status === "paid") return <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-4 w-4" /></div>;
  if (status === "pending") return <div className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-700"><Clock className="h-4 w-4" /></div>;
  return <div className="grid h-8 w-8 place-items-center rounded-full bg-rose-100 text-rose-700"><XCircle className="h-4 w-4" /></div>;
}

function statusTone(s: string) {
  if (s === "paid") return "border-emerald-200 text-emerald-700";
  if (s === "pending") return "border-amber-200 text-amber-700";
  return "border-rose-200 text-rose-700";
}
