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

function EmptyJobs() {
  return (
    <div className="grid place-items-center px-4 py-10">
      <div className="flex max-w-md flex-col items-center text-center">
        <svg viewBox="0 0 240 180" className="h-40 w-56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {/* desk */}
          <path d="M20 150 H220" className="text-muted-foreground/40" />
          <path d="M40 150 V170 M200 150 V170" className="text-muted-foreground/40" />
          {/* laptop */}
          <rect x="70" y="115" width="100" height="35" rx="3" className="text-muted-foreground/60" />
          <path d="M60 152 H180" className="text-muted-foreground/60" />
          {/* person */}
          <circle cx="120" cy="60" r="18" className="text-violet" />
          <path d="M120 78 V115" className="text-violet" />
          <path d="M120 90 L100 108 M120 90 L140 108" className="text-violet" />
          {/* thought bubble w/ briefcase */}
          <path d="M170 40 q10 -10 22 -6 q10 4 8 16 q-2 10 -14 12 q-8 1 -12 -4" className="text-violet/70" />
          <circle cx="164" cy="52" r="2" className="text-violet/70" />
          <circle cx="158" cy="58" r="1.5" className="text-violet/70" />
          <rect x="176" y="46" width="16" height="12" rx="1.5" className="text-violet" />
          <path d="M182 46 v-2 h4 v2" className="text-violet" />
          {/* squiggles */}
          <path d="M35 40 q6 -6 12 0 t12 0" className="text-cream/80 stroke-violet/40" />
          <path d="M195 90 q6 -6 12 0" className="text-violet/40" />
        </svg>
        <h3 className="mt-4 font-display text-xl">No work available right now</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          We're actively matching roles to your profile. We'll notify you the moment something great opens up.
        </p>
        <a href="/freelancer/onboarding" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-violet px-4 py-2 text-xs font-medium text-white hover:opacity-90">
          Improve your Talent Score
        </a>
      </div>
    </div>
  );
}
