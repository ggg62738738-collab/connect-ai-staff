import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin/page-header";
import {
  listApplicationsDetailed, updateApplicationStage, assignRecruiter, listStaff,
  listApplicationNotes, addApplicationNote, type ApplicationDetail,
} from "@/lib/admin.functions";
import type { Application } from "@/lib/admin-data";
import { toast } from "sonner";
import { Loader2, UserCog } from "lucide-react";

export const Route = createFileRoute("/admin/applications")({ component: ApplicationsPage });

const STAGES: { id: Application["stage"]; label: string; tone: string }[] = [
  { id: "applied",    label: "Applied",    tone: "bg-slate-100 text-slate-700" },
  { id: "screening",  label: "Screening",  tone: "bg-sky-100 text-sky-700" },
  { id: "interview",  label: "Interview",  tone: "bg-amber-100 text-amber-700" },
  { id: "offer",      label: "Offer",      tone: "bg-violet/15 text-violet" },
  { id: "hired",      label: "Hired",      tone: "bg-emerald-100 text-emerald-700" },
  { id: "rejected",   label: "Rejected",   tone: "bg-rose-100 text-rose-700" },
];

function ApplicationsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "applications", "detailed"],
    queryFn: () => listApplicationsDetailed(),
  });
  const { data: staff = [] } = useQuery({ queryKey: ["admin", "staff"], queryFn: () => listStaff() });
  const [active, setActive] = useState<ApplicationDetail | null>(null);

  const stageMut = useMutation({
    mutationFn: (v: { id: string; stage: Application["stage"] }) =>
      updateApplicationStage({ data: v }),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: ["admin", "applications", "detailed"] });
      const prev = qc.getQueryData<ApplicationDetail[]>(["admin", "applications", "detailed"]);
      qc.setQueryData<ApplicationDetail[]>(["admin", "applications", "detailed"], (old) =>
        (old ?? []).map((a) => (a.id === v.id ? { ...a, stage: v.stage } : a)),
      );
      return { prev };
    },
    onError: (err: any, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["admin", "applications", "detailed"], ctx.prev);
      toast.error(err?.message ?? "Could not update stage");
    },
    onSuccess: () => toast.success("Stage updated"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["admin", "applications", "detailed"] }),
  });

  const assignMut = useMutation({
    mutationFn: (v: { id: string; recruiterId: string | null }) =>
      assignRecruiter({ data: v }),
    onSuccess: () => {
      toast.success("Recruiter updated");
      qc.invalidateQueries({ queryKey: ["admin", "applications", "detailed"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <>
      <PageHeader title="Applications" subtitle="Move candidates through the pipeline." />
      <div className="p-6">
        {isLoading ? (
          <div className="grid place-items-center py-20 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6"
          onDragOver={(e) => e.preventDefault()}
        >
          {STAGES.map((s) => {
            const items = data.filter((a) => a.stage === s.id);
            return (
              <Card
                key={s.id}
                className="bg-secondary/40"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain");
                  const app = data.find((a) => a.id === id);
                  if (app && app.stage !== s.id) stageMut.mutate({ id, stage: s.id });
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">{s.label}</CardTitle>
                  <Badge variant="outline">{items.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map((a) => (
                    <button
                      key={a.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", a.id)}
                      onClick={() => setActive(a)}
                      className="w-full rounded-lg border bg-card p-3 text-left shadow-sm transition hover:border-violet/60"
                    >
                      <p className="text-sm font-medium">{a.freelancer}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.jobTitle}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.company}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + s.tone}>{a.match}% match</span>
                        <span className="text-[10px] text-muted-foreground">{a.submitted}</span>
                      </div>
                      {a.recruiterName ? (
                        <p className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground"><UserCog className="h-3 w-3" /> {a.recruiterName}</p>
                      ) : null}
                    </button>
                  ))}
                  {items.length === 0 ? (
                    <p className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">Empty</p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
        )}
      </div>

      <ApplicationDialog
        application={active}
        staff={staff}
        onOpenChange={(open) => !open && setActive(null)}
        onStageChange={(stage) => active && stageMut.mutate({ id: active.id, stage })}
        onAssign={(recruiterId) => active && assignMut.mutate({ id: active.id, recruiterId })}
      />
    </>
  );
}

function ApplicationDialog({
  application, staff, onOpenChange, onStageChange, onAssign,
}: {
  application: ApplicationDetail | null;
  staff: Array<{ id: string; name: string; role: string }>;
  onOpenChange: (open: boolean) => void;
  onStageChange: (stage: Application["stage"]) => void;
  onAssign: (recruiterId: string | null) => void;
}) {
  const qc = useQueryClient();
  const open = !!application;
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["admin", "application-notes", application?.id],
    queryFn: () => listApplicationNotes({ data: { applicationId: application!.id } }),
    enabled: open,
  });
  const [body, setBody] = useState("");
  const noteMut = useMutation({
    mutationFn: () => addApplicationNote({ data: { applicationId: application!.id, body } }),
    onSuccess: () => {
      setBody("");
      toast.success("Note added");
      qc.invalidateQueries({ queryKey: ["admin", "application-notes", application?.id] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to add note"),
  });

  const currentRecruiter = useMemo(() => application?.recruiterId ?? "unassigned", [application]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{application?.freelancer}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {application?.jobTitle} · {application?.company} · {application?.match}% match
          </p>
        </DialogHeader>
        {application ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Stage</label>
                <Select value={application.stage} onValueChange={(v) => onStageChange(v as Application["stage"])}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Assigned recruiter</label>
                <Select
                  value={currentRecruiter}
                  onValueChange={(v) => onAssign(v === "unassigned" ? null : v)}
                >
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} · {s.role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold">Candidate notes</h4>
              <div className="mt-2 space-y-2">
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Add a private note about this candidate…"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={() => noteMut.mutate()} disabled={!body.trim() || noteMut.isPending}>
                    {noteMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add note
                  </Button>
                </div>
              </div>
              <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                {isLoading ? (
                  <p className="text-xs text-muted-foreground">Loading…</p>
                ) : notes.length === 0 ? (
                  <p className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">No notes yet</p>
                ) : (
                  notes.map((n) => (
                    <div key={n.id} className="rounded-md border bg-card p-3">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground">{n.authorName}</span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}