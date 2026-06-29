import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { adminApi, fmtMoney } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/page-header";

export const Route = createFileRoute("/admin/contracts")({ component: ContractsPage });

const tone: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-100 text-slate-700",
  draft: "bg-amber-100 text-amber-700",
};

function ContractsPage() {
  const { data = [] } = useQuery({ queryKey: ["admin", "contracts"], queryFn: adminApi.contracts });
  return (
    <>
      <PageHeader
        title="Contracts"
        subtitle="Active engagements and historical agreements."
        actions={<Button size="sm"><Plus className="mr-1 h-4 w-4" /> New contract</Button>}
      />
      <div className="p-6">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract</TableHead>
                <TableHead>Freelancer</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-medium">{c.role}</p>
                    <p className="text-xs text-muted-foreground">{c.id}</p>
                  </TableCell>
                  <TableCell className="text-sm">{c.freelancer}</TableCell>
                  <TableCell className="text-sm">{c.company}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.start}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.end ?? "Open"}</TableCell>
                  <TableCell className="text-sm">{fmtMoney(c.value)}</TableCell>
                  <TableCell><Badge className={tone[c.status] + " hover:" + tone[c.status]}>{c.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}