import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/page-header";
import {
  listTimesheetsForReview, reviewTimesheet, type AdminTimesheet,
} from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/timesheets")({ component: AdminTimesheetsPage });

const tone: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-sky-100 text-sky-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

function AdminTimesheetsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "timesheets"], queryFn: () => listTimesheetsForReview(),
  });
  const [active, setActive] = useState<AdminTimesheet | null>(null);
  const [reason, setReason] = useState("");

  const reviewMut = useMutation({
    mutationFn: (v: { id: string; status: "approved" | "rejected" }) =>
      reviewTimesheet({ data: { ...v, notes: reason } }),
    onSuccess: () => {
      toast.success("Timesheet reviewed");
      setActive(null); setReason("");
      qc.invalidateQueries({ queryKey: ["admin", "timesheets"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const groups = useMemo(() => ({
    submitted: data.filter((t) => t.status === "submitted"),
    approved: data.filter((t) => t.status === "approved"),
    rejected: data.filter((t) => t.status === "rejected"),
    draft: data.filter((t) => t.status === "draft"),
  }), [data]);

  const renderTable = (rows: AdminTimesheet[]) => (
    <Card className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Freelancer</TableHead>
            <TableHead>Role · Company</TableHead>
            <TableHead>Week</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">Nothing here.</TableCell></TableRow>
          ) : rows.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.freelancer}</TableCell>
              <TableCell className="text-sm">{t.role} · {t.company}</TableCell>
              <TableCell className="text-sm">{t.weekStart}</TableCell>
              <TableCell className="text-sm">{t.hours}h</TableCell>
              <TableCell><Badge className={tone[t.status] + " hover:" + tone[t.status]}>{t.status}</Badge></TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => setActive(t)}>Review</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <>
      <PageHeader title="Timesheets" subtitle="Approve or reject weekly hours from freelancers." />
      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <Tabs defaultValue="submitted">
            <TabsList className="flex-wrap">
              <TabsTrigger value="submitted">Pending ({groups.submitted.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({groups.approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({groups.rejected.length})</TabsTrigger>
              <TabsTrigger value="draft">Drafts ({groups.draft.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="submitted" className="mt-4">{renderTable(groups.submitted)}</TabsContent>
            <TabsContent value="approved" className="mt-4">{renderTable(groups.approved)}</TabsContent>
            <TabsContent value="rejected" className="mt-4">{renderTable(groups.rejected)}</TabsContent>
            <TabsContent value="draft" className="mt-4">{renderTable(groups.draft)}</TabsContent>
          </Tabs>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => { if (!o) { setActive(null); setReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review timesheet</DialogTitle>
          </DialogHeader>
          {active ? (
            <div className="space-y-3 text-sm">
              <div className="rounded-md border bg-muted/40 p-3">
                <p className="font-medium">{active.freelancer}</p>
                <p className="text-xs text-muted-foreground">{active.role} · {active.company}</p>
                <p className="mt-2">Week of <span className="font-medium">{active.weekStart}</span> · <span className="font-medium">{active.hours}h</span></p>
                {active.notes ? <p className="mt-2 whitespace-pre-wrap text-xs">{active.notes}</p> : null}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Reviewer notes (optional)</label>
                <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Add a note for the freelancer…" />
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={reviewMut.isPending}
              onClick={() => active && reviewMut.mutate({ id: active.id, status: "rejected" })}>
              Reject
            </Button>
            <Button disabled={reviewMut.isPending}
              onClick={() => active && reviewMut.mutate({ id: active.id, status: "approved" })}>
              {reviewMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
