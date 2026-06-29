import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi, type Application } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/page-header";

export const Route = createFileRoute("/admin/applications")({ component: ApplicationsPage });

const STAGES: { id: Application["stage"]; label: string; tone: string }[] = [
  { id: "applied",    label: "Applied",    tone: "bg-slate-100 text-slate-700" },
  { id: "screening",  label: "Screening",  tone: "bg-sky-100 text-sky-700" },
  { id: "interview",  label: "Interview",  tone: "bg-amber-100 text-amber-700" },
  { id: "offer",      label: "Offer",      tone: "bg-violet/15 text-violet" },
  { id: "hired",      label: "Hired",      tone: "bg-emerald-100 text-emerald-700" },
  { id: "rejected",   label: "Rejected",   tone: "bg-rose-100 text-rose-700" },
];

function ApplicationsPage() {
  const { data = [] } = useQuery({ queryKey: ["admin", "applications"], queryFn: adminApi.applications });

  return (
    <>
      <PageHeader
        title="Applications"
        subtitle="Move candidates through the pipeline."
      />
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {STAGES.map((s) => {
            const items = data.filter((a) => a.stage === s.id);
            return (
              <Card key={s.id} className="bg-secondary/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">{s.label}</CardTitle>
                  <Badge variant="outline">{items.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map((a) => (
                    <div key={a.id} className="rounded-lg border bg-card p-3 shadow-sm">
                      <p className="text-sm font-medium">{a.freelancer}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.jobTitle}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.company}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + s.tone}>{a.match}% match</span>
                        <span className="text-[10px] text-muted-foreground">{a.submitted}</span>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 ? (
                    <p className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">Empty</p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}