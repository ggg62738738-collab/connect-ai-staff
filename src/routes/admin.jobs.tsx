import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminApi, fmtMoney } from "@/lib/admin-data";
import { listCompaniesLite, adminCreateJob, adminUpdateJobStatus } from "@/lib/admin.functions";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/jobs")({ component: JobsPage });

const tone: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  filled: "bg-violet/15 text-violet",
  closed: "bg-muted text-muted-foreground",
};

function JobsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin", "jobs"], queryFn: adminApi.jobs });
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState(false);
  const rows = tab === "all" ? data : data.filter((j) => j.status === tab);

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "open" | "filled" | "closed" }) =>
      adminUpdateJobStatus({ data: v }),
    onSuccess: () => {
      toast.success("Job updated");
      qc.invalidateQueries({ queryKey: ["admin", "jobs"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <>
      <PageHeader
        title="Jobs"
        subtitle="Open roles posted by hiring teams."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Post job
          </Button>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">All ({data.length})</TabsTrigger>
            <TabsTrigger value="open">Open ({data.filter((j) => j.status === "open").length})</TabsTrigger>
            <TabsTrigger value="filled">Filled ({data.filter((j) => j.status === "filled").length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({data.filter((j) => j.status === "closed").length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">Loading…</TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No jobs yet.</TableCell></TableRow>
              ) : rows.map((j) => (
                <TableRow key={j.id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate({ to: "/admin/jobs/$jobId", params: { jobId: j.id } })}>
                  <TableCell className="font-medium">{j.title}</TableCell>
                  <TableCell className="text-sm">{j.company}</TableCell>
                  <TableCell><Badge variant="outline">{j.type}</Badge></TableCell>
                  <TableCell className="text-sm">{fmtMoney(j.budget)}</TableCell>
                  <TableCell className="text-sm">{j.applicants}</TableCell>
                  <TableCell><Badge className={tone[j.status] + " hover:" + tone[j.status]}>{j.status}</Badge></TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">Change…</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => statusMut.mutate({ id: j.id, status: "open" })}>Mark Open</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => statusMut.mutate({ id: j.id, status: "filled" })}>Mark Filled</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => statusMut.mutate({ id: j.id, status: "closed" })}>Close</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <PostJobDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function PostJobDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const qc = useQueryClient();
  const { data: companies = [] } = useQuery({
    queryKey: ["admin", "companies-lite"], queryFn: () => listCompaniesLite(),
    enabled: open,
  });
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [type, setType] = useState<"Full-time" | "Part-time" | "Contract">("Contract");
  const [budget, setBudget] = useState<number>(50000);
  const [description, setDescription] = useState("");

  const mut = useMutation({
    mutationFn: () => adminCreateJob({ data: { title, companyId, type, budget, description } }),
    onSuccess: () => {
      toast.success("Job posted");
      setTitle(""); setCompanyId(""); setBudget(50000); setDescription("");
      qc.invalidateQueries({ queryKey: ["admin", "jobs"] });
      qc.invalidateQueries({ queryKey: ["fl", "open-jobs"] });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Post a new job</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior React Engineer" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Company</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Budget (₹)</Label>
            <Input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Responsibilities, must-have skills, location…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || !title || !companyId}>
            {mut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Post job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
