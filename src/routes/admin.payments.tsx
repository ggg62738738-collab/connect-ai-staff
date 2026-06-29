import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { adminApi, fmtMoney } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { CreditCard, Wallet, Receipt as ReceiptIcon } from "lucide-react";

export const Route = createFileRoute("/admin/payments")({ component: PaymentsPage });

const tone: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-rose-100 text-rose-700",
};

function PaymentsPage() {
  const { data = [] } = useQuery({ queryKey: ["admin", "payments"], queryFn: adminApi.payments });
  const incoming = data.filter((p) => p.direction === "in").reduce((s, p) => s + p.amount, 0);
  const outgoing = data.filter((p) => p.direction === "out").reduce((s, p) => s + p.amount, 0);
  const pending = data.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Invoices in from companies and payouts out to freelancers."
        actions={<Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" /> Export CSV</Button>}
      />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Incoming (MTD)" value={fmtMoney(incoming)} icon={Wallet} />
          <StatCard label="Payouts (MTD)" value={fmtMoney(outgoing)} icon={CreditCard} />
          <StatCard label="Pending settlement" value={fmtMoney(pending)} icon={ReceiptIcon} />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.invoice}</TableCell>
                    <TableCell className="text-sm">{p.party}</TableCell>
                    <TableCell>
                      <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium " + (p.direction === "in" ? "bg-emerald-100 text-emerald-700" : "bg-violet/15 text-violet")}>
                        {p.direction === "in" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {p.direction === "in" ? "Incoming" : "Payout"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{fmtMoney(p.amount)}</TableCell>
                    <TableCell><Badge className={tone[p.status] + " hover:" + tone[p.status]}>{p.status}</Badge></TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{p.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}