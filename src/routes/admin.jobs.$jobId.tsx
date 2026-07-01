import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Users, Briefcase, TrendingUp, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { getJobDetail, listJobApplicants, adminUpdateJobStatus, updateApplicationStage } from "@/lib/admin.functions";
import { fmtMoney, initials } from "@/lib/admin-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/jobs/$jobId")({ component: JobDetailPage });

const stageTone: Record<string, string> = {
  applied: "bg-slate-100 text-slate-700",
  screening: "bg-sky-100 text-sky-700",
  interview: "bg-amber-100 text-amber-700",
  offer: "bg-violet/15 text-violet",
  hired: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: job, isLoading } = useQuery({
    queryKey: ["admin", "job", jobId], queryFn: () => getJobDetail({ data: { id: jobId } }),
  });
  const { data: applicants = [] } = useQuery({
    queryKey: ["admin", "job-applicants", jobId], queryFn: () => listJobApplicants({ data: { jobId } }),
  });

  const statusMut = useMutation({
    mutationFn: (status: "open" | "filled" | "closed") =>
      adminUpdateJobStatus({ data: { id: jobId, status } }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin", "job", jobId] }); qc.invalidateQueries({ queryKey: ["admin", "jobs"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const stageMut = useMutation({
    mutationFn: (v: { id: string; stage: any }) => updateApplicationStage({ data: v }),
    onSuccess: () => { toast.success("Applicant updated"); qc.invalidateQueries({ queryKey: ["admin", "job-applicants", jobId] }); qc.invalidateQueries({ queryKey: ["admin", "job", jobId] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (isLoading || !job) {
    return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  const stageBuckets = ["applied", "screening", "interview", "offer", "hired", "rejected"].map((s) => ({
    stage: s, count: applicants.filter((a) => a.stage === s).length,
  }));

  return (
    <>
      <PageHeader
        title={job.title}
        subtitle={`${job.company} · Posted ${job.postedAt}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/jobs" })}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Select value={job.status} onValueChange={(v) => statusMut.mutate(v as any)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile icon={<Users className="h-4 w-4" />} label="Applicants" value={job.applicantsCount} />
          <StatTile icon={<TrendingUp className="h-4 w-4" />} label="In pipeline" value={job.inPipeline} />
          <StatTile icon={<Star className="h-4 w-4" />} label="Hired" value={job.hiredCount} />
          <StatTile icon={<Briefcase className="h-4 w-4" />} label="Budget" value={fmtMoney(job.budget)} />
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applicants">Applicants ({applicants.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Role details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{job.type}</Badge>
                  <Badge>{job.status}</Badge>
                </div>
                <p className="whitespace-pre-line text-muted-foreground">{job.description || "No description provided."}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applicants" className="mt-4 space-y-2">
            {applicants.length === 0 ? (
              <p className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">No applicants yet.</p>
            ) : applicants.map((a) => (
              <Card key={a.id}>
                <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 p-4 sm:flex sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet text-xs font-semibold text-white">{initials(a.name)}</div>
                    <div className="min-w-0">
                      <Link to="/admin/freelancers/$id" params={{ id: a.freelancerId }} className="truncate text-sm font-semibold hover:underline">{a.name}</Link>
                      <p className="truncate text-xs text-muted-foreground">{a.title} · {a.match}% match · {a.submittedAt}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {a.skills.slice(0, 4).map((s: string) => <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                    <Badge className={stageTone[a.stage] + " hover:" + stageTone[a.stage]}>{a.stage}</Badge>
                    <Select value={a.stage} onValueChange={(v) => stageMut.mutate({ id: a.id, stage: v })}>
                      <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["applied", "screening", "interview", "offer", "hired", "rejected"].map((s) =>
                          <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Pipeline breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {stageBuckets.map((b) => (
                  <div key={b.stage} className="flex items-center gap-3">
                    <div className="w-24 text-xs capitalize text-muted-foreground">{b.stage}</div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-violet" style={{ width: `${applicants.length ? (b.count / applicants.length) * 100 : 0}%` }} />
                    </div>
                    <div className="w-8 text-right text-xs font-semibold">{b.count}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet/10 text-violet">{icon}</div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="truncate font-display text-lg">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
