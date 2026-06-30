import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
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

  return (
    <>
      <PageHeader title="My applications" subtitle="Track where each role stands." />
      <div className="space-y-3 p-6">
        {isLoading ? (
          <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : data.length === 0 ? (
          <p className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">You haven't applied to anything yet.</p>
        ) : data.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">{a.jobTitle}</p>
                <p className="text-xs text-muted-foreground">{a.company} · Submitted {a.submittedAt} · {a.match}% match</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={"rounded-full px-2.5 py-1 text-[11px] font-medium capitalize " + (stageTone[a.stage] ?? "")}>{a.stage}</span>
                {!["hired", "rejected"].includes(a.stage) ? (
                  <Button variant="outline" size="sm" disabled={withdraw.isPending}
                    onClick={() => withdraw.mutate(a.id)}>
                    Withdraw
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}