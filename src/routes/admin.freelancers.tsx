import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { adminApi, initials } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/page-header";

export const Route = createFileRoute("/admin/freelancers")({
  component: FreelancersPage,
});

const statusTone: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  suspended: "bg-rose-100 text-rose-700",
};

function FreelancersPage() {
  const navigate = useNavigate();
  const { data = [] } = useQuery({ queryKey: ["admin", "freelancers"], queryFn: adminApi.freelancers });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const rows = useMemo(() => data.filter((f) => {
    const matchQ = q === "" || (f.name + f.title + f.skills.join(" ")).toLowerCase().includes(q.toLowerCase());
    const matchS = status === "all" || f.status === status;
    return matchQ && matchS;
  }), [data, q, status]);

  return (
    <>
      <PageHeader
        title="Talents"
        subtitle={`${data.length} students, freelancers & professionals in the network`}
        actions={<Button size="sm"><Plus className="mr-1 h-4 w-4" /> Invite talent</Button>}
      />
      <div className="p-6 space-y-4">
        <Card>
          <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, role, skill…" className="pl-9" />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Freelancer</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((f) => (
                <TableRow key={f.id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate({ to: "/admin/freelancers/$id", params: { id: f.userId } })}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full text-xs font-semibold text-white"
                        style={{ background: f.avatarColor }}>
                        {initials(f.name)}
                      </div>
                      <div>
                        <p className="font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.title}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {f.skills.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{f.location}</TableCell>
                  <TableCell className="text-sm">₹{f.rate}/hr</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {f.rating}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusTone[f.status] + " hover:" + statusTone[f.status]}>{f.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{f.joined}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">No freelancers match your filters.</TableCell></TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}