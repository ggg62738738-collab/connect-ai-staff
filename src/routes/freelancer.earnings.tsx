import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { listMyPayouts } from "@/lib/freelancer.functions";
import { fmtMoney } from "@/lib/admin-data";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/freelancer/earnings")({ component: EarningsPage });

function EarningsPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ["fl", "my-payouts"], queryFn: () => listMyPayouts() });
  const total = data.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  return (
    <>
      <PageHeader title="Earnings" subtitle="Payouts and invoices." />
      <div className="space-y-4 p-6">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Lifetime earnings</p>
              <p className="font-display text-2xl">{fmtMoney(total)}</p>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-2">
          {isLoading ? (
            <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : data.length === 0 ? (
            <p className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">No payouts yet.</p>
          ) : data.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{p.invoice}</p>
                  <p className="text-xs text-muted-foreground">{p.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{fmtMoney(p.amount)}</span>
                  <Badge variant="outline" className="capitalize">{p.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}