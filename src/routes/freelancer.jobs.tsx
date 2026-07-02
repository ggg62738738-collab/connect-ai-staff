import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin/page-header";
import { listOpenJobs, applyToJob, type OpenJob } from "@/lib/freelancer.functions";
import { fmtMoney } from "@/lib/admin-data";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

export const Route = createFileRoute("/freelancer/jobs")({ component: JobsPage });

function JobsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["fl", "open-jobs"], queryFn: () => listOpenJobs() });
  const [q, setQ] = useState("");
  const [active, setActive] = useState<OpenJob | null>(null);
  const [cover, setCover] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return data;
    return data.filter((j) =>
      j.title.toLowerCase().includes(t) ||
      j.company.toLowerCase().includes(t) ||
      (j.description ?? "").toLowerCase().includes(t),
    );
  }, [data, q]);

  const applyMut = useMutation({
    mutationFn: (v: { jobId: string; coverLetter: string }) => applyToJob({ data: v }),
    onSuccess: () => {
      toast.success("Application submitted");
      setActive(null); setCover("");
      qc.invalidateQueries({ queryKey: ["fl", "open-jobs"] });
      qc.invalidateQueries({ queryKey: ["fl", "my-applications"] });
      qc.invalidateQueries({ queryKey: ["fl", "metrics"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not apply"),
  });

  return (
    <>
      <PageHeader title="Find work" subtitle="Browse open roles matched to your profile." />
      <div className="p-6">
        <div className="mb-4 max-w-md">
          <Input placeholder="Search role, company, keyword…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {isLoading ? (
          <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((j) => (
              <Card key={j.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold">{j.title}</p>
                      <Badge variant="secondary">{j.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{j.company} · Posted {j.postedAt}</p>
                    {j.description ? (
                      <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-muted-foreground">{j.description}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{fmtMoney(j.budget)}</span>
                    {j.hasApplied ? (
                      <Button variant="secondary" disabled className="gap-1.5"><Check className="h-4 w-4" /> Applied</Button>
                    ) : (
                      <Button onClick={() => setActive(j)}>Apply</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 ? <EmptyJobs /> : null}

          </div>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => { if (!o) { setActive(null); setCover(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to {active?.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">{active?.company} · {fmtMoney(active?.budget ?? 0)}</p>
          </DialogHeader>
          <Textarea rows={6} placeholder="Tell the team why you're a great fit (optional)…" value={cover} onChange={(e) => setCover(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
            <Button
              disabled={applyMut.isPending}
              onClick={() => active && applyMut.mutate({ jobId: active.id, coverLetter: cover })}
            >
              {applyMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}