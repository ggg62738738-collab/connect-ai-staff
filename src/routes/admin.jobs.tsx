import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { adminApi, fmtMoney } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/page-header";

export const Route = createFileRoute("/admin/jobs")({ component: JobsPage });

const tone: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  filled: "bg-violet/15 text-violet",
  closed: "bg-muted text-muted-foreground",
};

function JobsPage() {
  const { data = [] } = useQuery({ queryKey: ["admin", "jobs"], queryFn: adminApi.jobs });
  const [tab, setTab] = useState("all");
  const rows = tab === "all" ? data : data.filter((j) => j.status === tab);
  return (
    <>
      <PageHeader
        title="Jobs"
        subtitle="Open roles posted by hiring teams."
        actions={<Button size="sm"><Plus className="mr-1 h-4 w-4" /> Post job</Button>}
      />
      <div className="p-6 space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All ({data.length})</TabsTrigger>
            <TabsTrigger value="open">Open ({data.filter((j) => j.status === "open").length})</TabsTrigger>
            <TabsTrigger value="filled">Filled ({data.filter((j) => j.status === "filled").length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({data.filter((j) => j.status === "closed").length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Posted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="font-medium">{j.title}</TableCell>
                  <TableCell className="text-sm">{j.company}</TableCell>
                  <TableCell><Badge variant="outline">{j.type}</Badge></TableCell>
                  <TableCell className="text-sm">{fmtMoney(j.budget)}</TableCell>
                  <TableCell className="text-sm">{j.applicants}</TableCell>
                  <TableCell><Badge className={tone[j.status] + " hover:" + tone[j.status]}>{j.status}</Badge></TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{j.posted}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}