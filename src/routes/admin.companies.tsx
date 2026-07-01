import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { adminApi, fmtMoney, initials } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/page-header";

export const Route = createFileRoute("/admin/companies")({ component: CompaniesPage });

const tone: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  trial: "bg-sky-100 text-sky-700",
  churned: "bg-rose-100 text-rose-700",
};

function CompaniesPage() {
  const { data = [] } = useQuery({ queryKey: ["admin", "companies"], queryFn: adminApi.companies });
  const [q, setQ] = useState("");
  const rows = useMemo(
    () => data.filter((c) => (c.name + c.industry + c.contact).toLowerCase().includes(q.toLowerCase())),
    [data, q],
  );

  return (
    <>
      <PageHeader
        title="Companies"
        subtitle={`${data.length} hiring teams on Workvia`}
        actions={<Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add company</Button>}
      />
      <div className="p-6 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by company, industry, contact…" className="pl-9" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Spend (YTD)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-xs font-semibold">{initials(c.name)}</div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.industry}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.size}</TableCell>
                  <TableCell><Badge variant="outline">{c.plan}</Badge></TableCell>
                  <TableCell className="text-sm">{c.contact}</TableCell>
                  <TableCell className="text-sm">{fmtMoney(c.spend)}</TableCell>
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