import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/freelancer/empty-state";
import { listMyContracts } from "@/lib/freelancer.functions";
import { fmtMoney } from "@/lib/admin-data";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/freelancer/contracts")({ component: ContractsPage });

function ContractsPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ["fl", "my-contracts"], queryFn: () => listMyContracts() });
  return (
    <>
      <PageHeader title="Contracts" subtitle="Your active and past engagements." />
      <div className="space-y-3 p-6">
        {isLoading ? (
          <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : data.length === 0 ? (
          <p className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">No contracts yet.</p>
        ) : data.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">{c.role}</p>
                <p className="text-xs text-muted-foreground">{c.company} · {c.start} → {c.end ?? "ongoing"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{fmtMoney(c.value)}</span>
                <Badge variant="outline" className="capitalize">{c.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}