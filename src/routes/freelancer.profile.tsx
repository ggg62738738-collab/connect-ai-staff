import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/admin/page-header";
import { getMyFreelancerProfile, updateMyFreelancerProfile, type FreelancerProfile } from "@/lib/freelancer.functions";
import { getMyOnboarding } from "@/lib/onboarding.functions";
import { toast } from "sonner";
import { Loader2, X, Star, ExternalLink, Mail, MapPin, Briefcase, GraduationCap, Award, FolderKanban, ShieldCheck, Pencil } from "lucide-react";

export const Route = createFileRoute("/freelancer/profile")({ component: ProfilePage });


function ProfilePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["fl", "profile"], queryFn: () => getMyFreelancerProfile() });
  const [form, setForm] = useState<FreelancerProfile | null>(null);
  const [skillDraft, setSkillDraft] = useState("");

  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = useMutation({
    mutationFn: () => updateMyFreelancerProfile({ data: form! }),
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["fl", "profile"] });
      qc.invalidateQueries({ queryKey: ["session", "me"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (isLoading || !form) {
    return (
      <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
    );
  }

  const set = (k: keyof FreelancerProfile) => (v: string | number | string[]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <>
      <PageHeader title="Profile" subtitle="Keep your details current — this is what clients see." />
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Public profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Full name">
              <Input value={form.fullName} onChange={(e) => set("fullName")(e.target.value)} />
            </Field>
            <Field label="Headline">
              <Input placeholder="Senior React Engineer · Open to contract"
                value={form.headline} onChange={(e) => set("headline")(e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title">
                <Input value={form.title} onChange={(e) => set("title")(e.target.value)} />
              </Field>
              <Field label="Location">
                <Input value={form.location} onChange={(e) => set("location")(e.target.value)} />
              </Field>
              <Field label="Hourly rate (₹)">
                <Input type="number" min={0} value={form.rate} onChange={(e) => set("rate")(Number(e.target.value))} />
              </Field>
              <Field label="Availability">
                <Input placeholder="e.g. 30 hrs/wk" value={form.availability} onChange={(e) => set("availability")(e.target.value)} />
              </Field>
            </div>
            <Field label="Bio">
              <Textarea rows={5} value={form.bio} onChange={(e) => set("bio")(e.target.value)} />
            </Field>
            <Field label="Skills">
              <div className="flex flex-wrap items-center gap-2 rounded-md border bg-background p-2">
                {form.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1">
                    {s}
                    <button type="button" onClick={() => set("skills")(form.skills.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  className="flex-1 min-w-[120px] bg-transparent text-sm outline-none"
                  placeholder="Add skill and press Enter"
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && skillDraft.trim()) {
                      e.preventDefault();
                      const v = skillDraft.trim();
                      if (!form.skills.includes(v)) set("skills")([...form.skills, v]);
                      setSkillDraft("");
                    }
                  }}
                />
              </div>
            </Field>
            <div className="flex justify-end">
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Account">
              <Badge variant={form.status === "active" ? "default" : "outline"} className="capitalize">{form.status}</Badge>
            </Row>
            <Row label="Rating"><span className="font-medium">{form.rating?.toFixed(1) ?? "—"}</span></Row>
            <Row label="Skills"><span>{form.skills.length}</span></Row>
            <p className="text-xs text-muted-foreground">
              New accounts start in <em>pending</em> vetting. A recruiter will review your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between"><span className="text-muted-foreground">{label}</span>{children}</div>
  );
}