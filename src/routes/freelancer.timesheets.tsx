import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/freelancer/empty-state";
import {
  listMyTimesheets, listMyActiveContracts, submitTimesheet,
} from "@/lib/freelancer.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/freelancer/timesheets")({ component: TimesheetsPage });

const tone: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-sky-100 text-sky-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

// Returns Monday (ISO YYYY-MM-DD) of the given date
function mondayOf(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // 0 = Mon
  x.setDate(x.getDate() - day);
  return x.toISOString().slice(0, 10);
}

function TimesheetsPage() {
  const qc = useQueryClient();
  const { data: contracts = [] } = useQuery({
    queryKey: ["fl", "active-contracts"], queryFn: () => listMyActiveContracts(),
  });
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["fl", "my-timesheets"], queryFn: () => listMyTimesheets(),
  });
  const [open, setOpen] = useState(false);

  const groups = useMemo(() => ({
    pending: rows.filter((r) => r.status === "draft" || r.status === "submitted"),
    approved: rows.filter((r) => r.status === "approved"),
    rejected: rows.filter((r) => r.status === "rejected"),
  }), [rows]);

  return (
    <>
      <PageHeader
        title="Timesheets"
        subtitle="Log weekly hours for your active engagements."
        actions={
          contracts.length ? (
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Submit hours
            </Button>
          ) : null
        }
      />
      <div className="p-4 sm:p-6">
        {!contracts.length ? (
          <EmptyState variant="timesheets" title="No active contracts yet" description="Timesheets unlock the moment your first contract goes live." />
        ) : (
          <Tabs defaultValue="pending">
            <TabsList className="flex-wrap">
              <TabsTrigger value="pending">Pending ({groups.pending.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({groups.approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({groups.rejected.length})</TabsTrigger>
            </TabsList>
            {(["pending", "approved", "rejected"] as const).map((k) => (
              <TabsContent key={k} value={k} className="mt-4 space-y-2">
                {isLoading ? (
                  <div className="grid place-items-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : groups[k].length === 0 ? (
                  <EmptyState variant="timesheets" title="Nothing here" description={k === "pending" ? "Submit hours for your active week to see them here." : `No ${k} timesheets yet.`} />
                ) : groups[k].map((t) => (
                  <Card key={t.id}>
                    <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 sm:flex sm:flex-wrap sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{t.role}</p>
                        <p className="truncate text-xs text-muted-foreground">{t.company} · Week of {t.weekStart}</p>
                        {t.notes ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.notes}</p> : null}
                        {t.reviewNotes ? <p className="mt-1 text-xs text-rose-700">Reviewer: {t.reviewNotes}</p> : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm font-semibold">{t.hours}h</span>
                        <Badge className={tone[t.status] + " hover:" + tone[t.status]}>{t.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      <SubmitDialog
        open={open}
        contracts={contracts}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            qc.invalidateQueries({ queryKey: ["fl", "my-timesheets"] });
          }
        }}
      />
    </>
  );
}

function SubmitDialog({
  open, onOpenChange, contracts,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  contracts: Array<{ id: string; company: string; role: string }>;
}) {
  const [contractId, setContractId] = useState("");
  const [weekStart, setWeekStart] = useState(mondayOf(new Date()));
  const [hours, setHours] = useState<number>(40);
  const [notes, setNotes] = useState("");

  const mut = useMutation({
    mutationFn: (asDraft: boolean) =>
      submitTimesheet({ data: { contractId, weekStart, hours, notes, asDraft } }),
    onSuccess: () => { toast.success("Saved"); onOpenChange(false); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Submit timesheet</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Contract</Label>
            <Select value={contractId} onValueChange={setContractId}>
              <SelectTrigger><SelectValue placeholder="Select active contract" /></SelectTrigger>
              <SelectContent>
                {contracts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.role} · {c.company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Week starting (Mon)</Label>
              <Input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
            </div>
            <div>
              <Label>Hours</Label>
              <Input type="number" min={0} max={168} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Summary of work this week…" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" disabled={mut.isPending} onClick={() => mut.mutate(true)}>Save draft</Button>
          <Button disabled={mut.isPending || !contractId} onClick={() => mut.mutate(false)}>
            {mut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit for review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
