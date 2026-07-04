import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/freelancer/empty-state";
import { listMyApplications, withdrawApplication } from "@/lib/freelancer.functions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/freelancer/applications")({ component: AppsPage });

const stageTone: Record<string, string> = {
  applied: "bg-slate-100 text-slate-700",
  screening: "bg-sky-100 text-sky-700",
  interview: "bg-amber-100 text-amber-700",
  offer: "bg-violet/15 text-violet",
  hired: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

function AppsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["fl", "my-applications"], queryFn: () => listMyApplications() });
  const withdraw = useMutation({
    mutationFn: (id: string) => withdrawApplication({ data: { id } }),
    onSuccess: () => {
      toast.success("Application withdrawn");
      qc.invalidateQueries({ queryKey: ["fl", "my-applications"] });
      qc.invalidateQueries({ queryKey: ["fl", "open-jobs"] });
      qc.invalidateQueries({ queryKey: ["fl", "metrics"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const groups = useMemo(() => ({
    applied: data.filter((a) => ["applied", "screening"].includes(a.stage)),
    current: data.filter((a) => ["interview", "offer", "hired"].includes(a.stage)),
    completed: data.filter((a) => a.stage === "rejected"),
  }), [data]);

  const renderList = (list: typeof data) => list.length === 0 ? (
    <EmptyState variant="applications" title="Nothing here yet" description="Applications you submit will appear here so you can track every stage." />
  ) : list.map((a) => (
    <Card key={a.id}>
      <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{a.jobTitle}</p>
          <p className="truncate text-xs text-muted-foreground">{a.company} · {a.submittedAt} · {a.match}% match</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={"rounded-full px-2.5 py-1 text-[11px] font-medium capitalize " + (stageTone[a.stage] ?? "")}>{a.stage}</span>
          {!["hired", "rejected"].includes(a.stage) ? (
            <Button variant="outline" size="sm" disabled={withdraw.isPending} onClick={() => withdraw.mutate(a.id)}>
              Withdraw
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  ));

  return (
    <>
      <PageHeader title="My applications" subtitle="Track applied, current pipeline, and completed roles." />
      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <Tabs defaultValue="applied">
            <TabsList className="flex-wrap">
              <TabsTrigger value="applied">Applied ({groups.applied.length})</TabsTrigger>
              <TabsTrigger value="current">Current ({groups.current.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({groups.completed.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="applied" className="mt-4 space-y-2">{renderList(groups.applied)}</TabsContent>
            <TabsContent value="current" className="mt-4 space-y-2">{renderList(groups.current)}</TabsContent>
            <TabsContent value="completed" className="mt-4 space-y-2">{renderList(groups.completed)}</TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
