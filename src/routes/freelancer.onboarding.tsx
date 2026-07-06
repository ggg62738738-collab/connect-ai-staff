import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/admin/page-header";
import { getMyOnboarding, saveMyOnboarding, type OnboardingData } from "@/lib/onboarding.functions";
import { toast } from "sonner";
import { Loader2, Plus, Star, Trash2, X, ChevronRight } from "lucide-react";
import { FileUploadField } from "@/components/freelancer/file-upload-field";

export const Route = createFileRoute("/freelancer/onboarding")({ component: OnboardingPage });

const SECTIONS = [
  { id: "basic", title: "Basic information" },
  { id: "professional", title: "Professional" },
  { id: "skills", title: "Skills" },
  { id: "resume", title: "Resume & portfolio" },
  { id: "experience", title: "Work experience" },
  { id: "education", title: "Education" },
  { id: "certifications", title: "Certifications" },
  { id: "projects", title: "Projects" },
  { id: "preferences", title: "Job preferences" },
  { id: "verification", title: "Verification" },
  { id: "availability", title: "Availability" },
];

function OnboardingPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["fl", "onboarding"],
    queryFn: () => getMyOnboarding(),
  });
  const [form, setForm] = useState<OnboardingData>({});
  const [active, setActive] = useState("basic");

  useEffect(() => { if (data) setForm(data.data); }, [data]);

  const save = useMutation({
    mutationFn: () => saveMyOnboarding({ data: { data: form } }),
    onSuccess: (res) => {
      toast.success(`Saved · ${res.completion}% complete`);
      qc.invalidateQueries({ queryKey: ["fl", "onboarding"] });
      qc.invalidateQueries({ queryKey: ["fl", "profile"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  const set = <K extends keyof OnboardingData>(k: K) => (v: OnboardingData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const completion = useMemo(() => liveCompletion(form), [form]);

  if (isLoading) {
    return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <>
      <PageHeader
        title="Freelancer onboarding"
        subtitle="Complete your profile to unlock more opportunities and a higher Talent Score."
      />
      <div className="grid gap-6 p-6 lg:grid-cols-[260px_1fr_280px]">
        {/* Sidebar nav */}
        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Sections</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition ${active === s.id ? "bg-violet/10 text-violet" : "hover:bg-muted"}`}
              >
                <span><span className="text-muted-foreground mr-2">{i + 1}.</span>{s.title}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Form */}
        <div className="space-y-6">
          {active === "basic" && <BasicSection form={form} set={set} />}
          {active === "professional" && <ProfessionalSection form={form} set={set} />}
          {active === "skills" && <SkillsSection form={form} set={set} />}
          {active === "resume" && <ResumeSection form={form} set={set} />}
          {active === "experience" && <ExperienceSection form={form} set={set} />}
          {active === "education" && <EducationSection form={form} set={set} />}
          {active === "certifications" && <CertSection form={form} set={set} />}
          {active === "projects" && <ProjectsSection form={form} set={set} />}
          {active === "preferences" && <PreferencesSection form={form} set={set} />}
          {active === "verification" && <VerificationSection form={form} set={set} />}
          {active === "availability" && <AvailabilitySection form={form} set={set} />}

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => navigate({ to: "/freelancer" })}>Skip for now</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save progress
            </Button>
          </div>
        </div>

        {/* Completion + score */}
        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Profile completion</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-3xl">{completion}%</span>
                <span className="text-xs text-muted-foreground">live</span>
              </div>
              <Progress value={completion} className="mt-2" />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Talent score</span>
                <span className="font-display text-xl">{data?.talentScore ?? 0}/100</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Updates after each save. Boosted by completeness, projects, certifications & recruiter verification.
              </p>
            </div>
            <div className="space-y-1.5 text-xs">
              <Check label="Basic info" done={!!form.fullName && !!form.email} />
              <Check label="Skills" done={(form.skills?.length ?? 0) > 0} />
              <Check label="Resume" done={!!form.resumeUrl} />
              <Check label="Experience" done={(form.experience?.length ?? 0) > 0} />
              <Check label="Portfolio" done={(form.projects?.length ?? 0) > 0} />
              <Check label="Certifications" done={(form.certifications?.length ?? 0) > 0} />
              <Check label="Government ID" done={!!form.aadhaar || !!form.pan} />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function liveCompletion(d: OnboardingData) {
  const checks = [
    !!d.fullName, !!d.email, !!d.mobile, !!d.city, !!d.country,
    !!d.primaryRole, !!d.totalExperience, !!d.employmentStatus, (d.workMode?.length ?? 0) > 0,
    (d.skills?.length ?? 0) > 0, !!d.primarySkill,
    !!d.resumeUrl, !!d.links?.linkedin,
    (d.experience?.length ?? 0) > 0,
    (d.education?.length ?? 0) > 0,
    (d.certifications?.length ?? 0) > 0,
    (d.projects?.length ?? 0) > 0,
    !!d.expectedHourlyRate, !!d.noticePeriod,
    !!d.aadhaar || !!d.pan,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

// ============ Section components ============

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div><label className="text-xs font-medium text-muted-foreground">{label}</label><div className="mt-1.5">{children}</div></div>);
}
function Check({ label, done }: { label: string; done: boolean }) {
  return (<div className="flex items-center justify-between"><span className="text-muted-foreground">{label}</span><span className={done ? "text-emerald-600" : "text-muted-foreground/60"}>{done ? "✓" : "—"}</span></div>);
}

type SetFn = <K extends keyof OnboardingData>(k: K) => (v: OnboardingData[K]) => void;

function BasicSection({ form, set }: { form: OnboardingData; set: SetFn }) {
  return (
    <Section title="1. Basic information">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name"><Input value={form.fullName ?? ""} onChange={(e) => set("fullName")(e.target.value)} /></Field>
        <div className="sm:col-span-1"><FileUploadField label="Profile photo" kind="photo" accept="image/*" value={form.photoUrl} onChange={(v) => set("photoUrl")(v)} /></div>
        <Field label="Email"><Input type="email" value={form.email ?? ""} onChange={(e) => set("email")(e.target.value)} /></Field>
        <Field label="Mobile number"><Input value={form.mobile ?? ""} onChange={(e) => set("mobile")(e.target.value)} placeholder="+91…" /></Field>
        <Field label="Date of birth"><Input type="date" value={form.dob ?? ""} onChange={(e) => set("dob")(e.target.value)} /></Field>
        <Field label="Gender (optional)">
          <Select value={form.gender ?? ""} onValueChange={(v) => set("gender")(v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem><SelectItem value="na">Prefer not to say</SelectItem></SelectContent>
          </Select>
        </Field>
        <Field label="Current city"><Input value={form.city ?? ""} onChange={(e) => set("city")(e.target.value)} /></Field>
        <Field label="State"><Input value={form.state ?? ""} onChange={(e) => set("state")(e.target.value)} /></Field>
        <Field label="Country"><Input value={form.country ?? "India"} onChange={(e) => set("country")(e.target.value)} /></Field>
        <Field label="Nationality"><Input value={form.nationality ?? "Indian"} onChange={(e) => set("nationality")(e.target.value)} /></Field>
      </div>
      <ChipsField
        label="Languages known"
        values={form.languages ?? []}
        onChange={(v) => set("languages")(v)}
        placeholder="English, Hindi…"
      />
    </Section>
  );
}

function ProfessionalSection({ form, set }: { form: OnboardingData; set: SetFn }) {
  return (
    <Section title="2. Professional information">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Register as">
          <Select value={form.registerAs ?? ""} onValueChange={(v) => set("registerAs")(v as any)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="freelancer">Freelancer</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="fresher">Fresher</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Employment status">
          <Select value={form.employmentStatus ?? ""} onValueChange={(v) => set("employmentStatus")(v as any)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="employed">Employed</SelectItem>
              <SelectItem value="freelancer">Freelancer</SelectItem>
              <SelectItem value="looking">Looking for work</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Primary role"><Input value={form.primaryRole ?? ""} onChange={(e) => set("primaryRole")(e.target.value)} placeholder="e.g. Senior React Engineer" /></Field>
        <Field label="Secondary role"><Input value={form.secondaryRole ?? ""} onChange={(e) => set("secondaryRole")(e.target.value)} /></Field>
        <Field label="Current company"><Input value={form.currentCompany ?? ""} onChange={(e) => set("currentCompany")(e.target.value)} /></Field>
        <Field label="Current designation"><Input value={form.currentDesignation ?? ""} onChange={(e) => set("currentDesignation")(e.target.value)} /></Field>
        <Field label="Total experience (years)"><Input type="number" min={0} value={form.totalExperience ?? ""} onChange={(e) => set("totalExperience")(Number(e.target.value))} /></Field>
        <Field label="Relevant experience (years)"><Input type="number" min={0} value={form.relevantExperience ?? ""} onChange={(e) => set("relevantExperience")(Number(e.target.value))} /></Field>
        <Field label="Industry"><Input value={form.industry ?? ""} onChange={(e) => set("industry")(e.target.value)} /></Field>
        <Field label="Available from"><Input type="date" value={form.availableFrom ?? ""} onChange={(e) => set("availableFrom")(e.target.value)} /></Field>
        <Field label="Preferred shift">
          <Select value={form.preferredShift ?? ""} onValueChange={(v) => set("preferredShift")(v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent><SelectItem value="day">Day</SelectItem><SelectItem value="night">Night</SelectItem><SelectItem value="flexible">Flexible</SelectItem></SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Work mode">
        <div className="flex gap-2">
          {(["remote", "hybrid", "onsite"] as const).map((m) => {
            const active = (form.workMode ?? []).includes(m);
            return (
              <button
                key={m} type="button"
                onClick={() => {
                  const cur = new Set(form.workMode ?? []);
                  if (active) cur.delete(m); else cur.add(m);
                  set("workMode")(Array.from(cur) as any);
                }}
                className={`rounded-full border px-4 py-1.5 text-sm capitalize ${active ? "border-violet bg-violet/10 text-violet" : ""}`}
              >{m}</button>
            );
          })}
        </div>
      </Field>
      <ChipsField label="Preferred countries" values={form.preferredCountries ?? []} onChange={(v) => set("preferredCountries")(v)} placeholder="India, UAE…" />
    </Section>
  );
}

function SkillsSection({ form, set }: { form: OnboardingData; set: SetFn }) {
  const skills = form.skills ?? [];
  const update = (i: number, patch: Partial<{ name: string; level: number; years: number }>) =>
    set("skills")(skills.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  return (
    <Section title="3. Skills">
      <div className="space-y-2">
        {skills.map((s, i) => (
          <div key={i} className="grid grid-cols-12 items-center gap-2 rounded-md border p-2">
            <Input className="col-span-5" placeholder="Skill (e.g. React.js)" value={s.name} onChange={(e) => update(i, { name: e.target.value })} />
            <div className="col-span-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => update(i, { level: n })}>
                  <Star className={`h-5 w-5 ${n <= s.level ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
                </button>
              ))}
            </div>
            <Input className="col-span-2" type="number" min={0} placeholder="Yrs" value={s.years ?? ""} onChange={(e) => update(i, { years: Number(e.target.value) })} />
            <Button variant="ghost" size="icon" onClick={() => set("skills")(skills.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => set("skills")([...skills, { name: "", level: 3 }])}>
          <Plus className="mr-1.5 h-4 w-4" /> Add skill
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Primary skill"><Input value={form.primarySkill ?? ""} onChange={(e) => set("primarySkill")(e.target.value)} /></Field>
        <Field label="Secondary skill"><Input value={form.secondarySkill ?? ""} onChange={(e) => set("secondarySkill")(e.target.value)} /></Field>
      </div>
    </Section>
  );
}

function ResumeSection({ form, set }: { form: OnboardingData; set: SetFn }) {
  const links = form.links ?? {};
  const upd = (k: keyof typeof links) => (v: string) => set("links")({ ...links, [k]: v });
  return (
    <Section title="4. Resume & portfolio">
      <div className="grid gap-4 sm:grid-cols-2">
        <FileUploadField label="Resume (PDF)" kind="resume" accept="application/pdf,.doc,.docx"
          value={form.resumeUrl} onChange={(v) => set("resumeUrl")(v)} />
        <FileUploadField label="Cover letter (PDF)" kind="cover" accept="application/pdf,.doc,.docx"
          value={form.coverLetterUrl} onChange={(v) => set("coverLetterUrl")(v)} />
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground pt-2">Professional links</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="LinkedIn URL"><Input value={links.linkedin ?? ""} onChange={(e) => upd("linkedin")(e.target.value)} placeholder="https://linkedin.com/in/…" /></Field>
        <Field label="GitHub URL"><Input value={links.github ?? ""} onChange={(e) => upd("github")(e.target.value)} placeholder="https://github.com/…" /></Field>
        <Field label="Portfolio"><Input value={links.portfolio ?? ""} onChange={(e) => upd("portfolio")(e.target.value)} /></Field>
        <Field label="Behance"><Input value={links.behance ?? ""} onChange={(e) => upd("behance")(e.target.value)} /></Field>
        <Field label="Dribbble"><Input value={links.dribbble ?? ""} onChange={(e) => upd("dribbble")(e.target.value)} /></Field>
        <Field label="Stack Overflow"><Input value={links.stackoverflow ?? ""} onChange={(e) => upd("stackoverflow")(e.target.value)} /></Field>
        <Field label="Medium"><Input value={links.medium ?? ""} onChange={(e) => upd("medium")(e.target.value)} /></Field>
        <Field label="Personal website"><Input value={links.website ?? ""} onChange={(e) => upd("website")(e.target.value)} /></Field>
      </div>
    </Section>
  );
}

function ExperienceSection({ form, set }: { form: OnboardingData; set: SetFn }) {
  const items = form.experience ?? [];
  const upd = (i: number, patch: any) => set("experience")(items.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  return (
    <Section title="5. Work experience">
      {items.map((it, i) => (
        <div key={i} className="space-y-3 rounded-md border p-3">
          <div className="flex justify-between"><span className="text-sm font-medium">Experience #{i + 1}</span>
            <Button variant="ghost" size="icon" onClick={() => set("experience")(items.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Company"><Input value={it.company} onChange={(e) => upd(i, { company: e.target.value })} /></Field>
            <Field label="Designation"><Input value={it.designation} onChange={(e) => upd(i, { designation: e.target.value })} /></Field>
            <Field label="Employment type"><Input value={it.type ?? ""} onChange={(e) => upd(i, { type: e.target.value })} placeholder="Full-time / Contract" /></Field>
            <Field label="Start date"><Input type="date" value={it.startDate ?? ""} onChange={(e) => upd(i, { startDate: e.target.value })} /></Field>
            <Field label="End date"><Input type="date" value={it.endDate ?? ""} onChange={(e) => upd(i, { endDate: e.target.value })} disabled={it.current} /></Field>
            <div className="flex items-center gap-2 pt-6"><Switch checked={!!it.current} onCheckedChange={(v) => upd(i, { current: v })} /><span className="text-sm">Current company</span></div>
            <Field label="Technologies"><Input value={it.tech ?? ""} onChange={(e) => upd(i, { tech: e.target.value })} /></Field>
          </div>
          <Field label="Responsibilities"><Textarea rows={2} value={it.responsibilities ?? ""} onChange={(e) => upd(i, { responsibilities: e.target.value })} /></Field>
          <Field label="Major achievements"><Textarea rows={2} value={it.achievements ?? ""} onChange={(e) => upd(i, { achievements: e.target.value })} /></Field>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => set("experience")([...items, { company: "", designation: "" }])}>
        <Plus className="mr-1.5 h-4 w-4" /> Add experience
      </Button>
    </Section>
  );
}

function EducationSection({ form, set }: { form: OnboardingData; set: SetFn }) {
  const items = form.education ?? [];
  const upd = (i: number, patch: any) => set("education")(items.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  return (
    <Section title="6. Education">
      {items.map((it, i) => (
        <div key={i} className="space-y-3 rounded-md border p-3">
          <div className="flex justify-between"><span className="text-sm font-medium">Education #{i + 1}</span>
            <Button variant="ghost" size="icon" onClick={() => set("education")(items.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Degree"><Input value={it.degree} onChange={(e) => upd(i, { degree: e.target.value })} /></Field>
            <Field label="Branch"><Input value={it.branch ?? ""} onChange={(e) => upd(i, { branch: e.target.value })} /></Field>
            <Field label="College"><Input value={it.college} onChange={(e) => upd(i, { college: e.target.value })} /></Field>
            <Field label="University"><Input value={it.university ?? ""} onChange={(e) => upd(i, { university: e.target.value })} /></Field>
            <Field label="Graduation year"><Input value={it.gradYear ?? ""} onChange={(e) => upd(i, { gradYear: e.target.value })} /></Field>
            <Field label="CGPA"><Input value={it.cgpa ?? ""} onChange={(e) => upd(i, { cgpa: e.target.value })} /></Field>
            <Field label="Percentage"><Input value={it.percentage ?? ""} onChange={(e) => upd(i, { percentage: e.target.value })} /></Field>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => set("education")([...items, { degree: "", college: "" }])}>
        <Plus className="mr-1.5 h-4 w-4" /> Add education
      </Button>
    </Section>
  );
}

function CertSection({ form, set }: { form: OnboardingData; set: SetFn }) {
  const items = form.certifications ?? [];
  const upd = (i: number, patch: any) => set("certifications")(items.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  return (
    <Section title="7. Certifications">
      {items.map((it, i) => (
        <div key={i} className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
          <Field label="Certification name"><Input value={it.name} onChange={(e) => upd(i, { name: e.target.value })} /></Field>
          <Field label="Issued by"><Input value={it.issuer ?? ""} onChange={(e) => upd(i, { issuer: e.target.value })} /></Field>
          <Field label="Issue date"><Input type="date" value={it.issueDate ?? ""} onChange={(e) => upd(i, { issueDate: e.target.value })} /></Field>
          <Field label="Expiry"><Input type="date" value={it.expiry ?? ""} onChange={(e) => upd(i, { expiry: e.target.value })} /></Field>
          <Field label="Certificate URL"><Input value={it.url ?? ""} onChange={(e) => upd(i, { url: e.target.value })} /></Field>
          <div className="flex items-end"><Button variant="ghost" size="sm" onClick={() => set("certifications")(items.filter((_, idx) => idx !== i))}><Trash2 className="mr-1 h-4 w-4" /> Remove</Button></div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => set("certifications")([...items, { name: "" }])}>
        <Plus className="mr-1.5 h-4 w-4" /> Add certification
      </Button>
    </Section>
  );
}

function ProjectsSection({ form, set }: { form: OnboardingData; set: SetFn }) {
  const items = form.projects ?? [];
  const upd = (i: number, patch: any) => set("projects")(items.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  return (
    <Section title="8. Project portfolio">
      {items.map((it, i) => (
        <div key={i} className="space-y-3 rounded-md border p-3">
          <div className="flex justify-between"><span className="text-sm font-medium">Project #{i + 1}</span>
            <Button variant="ghost" size="icon" onClick={() => set("projects")(items.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Project name"><Input value={it.name} onChange={(e) => upd(i, { name: e.target.value })} /></Field>
            <Field label="Client"><Input value={it.client ?? ""} onChange={(e) => upd(i, { client: e.target.value })} /></Field>
            <Field label="Duration"><Input value={it.duration ?? ""} onChange={(e) => upd(i, { duration: e.target.value })} placeholder="6 months" /></Field>
            <Field label="Team size"><Input value={it.teamSize ?? ""} onChange={(e) => upd(i, { teamSize: e.target.value })} /></Field>
            <Field label="Role"><Input value={it.role ?? ""} onChange={(e) => upd(i, { role: e.target.value })} /></Field>
            <Field label="Technologies"><Input value={it.tech ?? ""} onChange={(e) => upd(i, { tech: e.target.value })} /></Field>
            <Field label="GitHub"><Input value={it.github ?? ""} onChange={(e) => upd(i, { github: e.target.value })} /></Field>
            <Field label="Live demo"><Input value={it.demo ?? ""} onChange={(e) => upd(i, { demo: e.target.value })} /></Field>
          </div>
          <Field label="Description"><Textarea rows={3} value={it.description ?? ""} onChange={(e) => upd(i, { description: e.target.value })} /></Field>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => set("projects")([...items, { name: "" }])}>
        <Plus className="mr-1.5 h-4 w-4" /> Add project
      </Button>
    </Section>
  );
}

function PreferencesSection({ form, set }: { form: OnboardingData; set: SetFn }) {
  return (
    <Section title="9. Job preferences">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Expected daily rate (₹)"><Input type="number" min={0} value={form.expectedDailyRate ?? ""} onChange={(e) => set("expectedDailyRate")(Number(e.target.value))} /></Field>
        <Field label="Expected hourly rate (₹)"><Input type="number" min={0} value={form.expectedHourlyRate ?? ""} onChange={(e) => set("expectedHourlyRate")(Number(e.target.value))} /></Field>
        <Field label="Expected monthly salary (₹)"><Input type="number" min={0} value={form.expectedMonthlySalary ?? ""} onChange={(e) => set("expectedMonthlySalary")(Number(e.target.value))} /></Field>
        <Field label="Minimum budget (₹)"><Input type="number" min={0} value={form.minBudget ?? ""} onChange={(e) => set("minBudget")(Number(e.target.value))} /></Field>
        <Field label="Preferred industry"><Input value={form.preferredIndustry ?? ""} onChange={(e) => set("preferredIndustry")(e.target.value)} /></Field>
        <Field label="Preferred location"><Input value={form.preferredLocation ?? ""} onChange={(e) => set("preferredLocation")(e.target.value)} /></Field>
        <Field label="Contract duration"><Input value={form.contractDuration ?? ""} onChange={(e) => set("contractDuration")(e.target.value)} placeholder="3 months / 6 months / Long-term" /></Field>
        <Field label="Notice period">
          <Select value={form.noticePeriod ?? ""} onValueChange={(v) => set("noticePeriod")(v as any)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="15">15 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <ChipsField label="Preferred technologies" values={form.preferredTech ?? []} onChange={(v) => set("preferredTech")(v)} />
      <div className="flex items-center gap-2"><Switch checked={!!form.remoteOnly} onCheckedChange={(v) => set("remoteOnly")(v)} /><span className="text-sm">Remote only</span></div>
    </Section>
  );
}

function VerificationSection({ form, set }: { form: OnboardingData; set: SetFn }) {
  return (
    <Section title="10. Verification">
      <p className="text-xs text-muted-foreground">Government IDs are stored securely and only used for recruiter verification.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Aadhaar number"><Input value={form.aadhaar ?? ""} onChange={(e) => set("aadhaar")(e.target.value)} placeholder="XXXX XXXX XXXX" /></Field>
        <Field label="PAN"><Input value={form.pan ?? ""} onChange={(e) => set("pan")(e.target.value.toUpperCase())} placeholder="ABCDE1234F" /></Field>
        <Field label="Passport (optional)"><Input value={form.passport ?? ""} onChange={(e) => set("passport")(e.target.value)} /></Field>
        <FileUploadField label="Company ID" kind="company-id" accept="image/*,application/pdf"
          value={form.companyIdUrl} onChange={(v) => set("companyIdUrl")(v)} />
        <FileUploadField label="Experience letter" kind="experience" accept="image/*,application/pdf"
          value={form.experienceLetterUrl} onChange={(v) => set("experienceLetterUrl")(v)} />
      </div>

    </Section>
  );
}

function AvailabilitySection({ form, set }: { form: OnboardingData; set: SetFn }) {
  return (
    <Section title="11. Availability">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Current status">
          <Select value={form.availabilityStatus ?? ""} onValueChange={(v) => set("availabilityStatus")(v as any)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Available immediately</SelectItem>
              <SelectItem value="15days">Available in 15 days</SelectItem>
              <SelectItem value="30days">Available in 30 days</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Hours per day"><Input type="number" min={0} max={24} value={form.hoursPerDay ?? ""} onChange={(e) => set("hoursPerDay")(Number(e.target.value))} /></Field>
        <Field label="Timezone"><Input value={form.timezone ?? "Asia/Kolkata"} onChange={(e) => set("timezone")(e.target.value)} /></Field>
      </div>

      <div className="flex flex-wrap gap-4">
        <Toggle label="Can travel" v={!!form.canTravel} on={(v) => set("canTravel")(v)} />
        <Toggle label="Can relocate" v={!!form.canRelocate} on={(v) => set("canRelocate")(v)} />
        <Toggle label="Passport available" v={!!form.passportAvailable} on={(v) => set("passportAvailable")(v)} />
        <Toggle label="Laptop available" v={!!form.laptopAvailable} on={(v) => set("laptopAvailable")(v)} />
      </div>
    </Section>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (<div className="flex items-center gap-2"><Switch checked={v} onCheckedChange={on} /><span className="text-sm">{label}</span></div>);
}

function ChipsField({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  return (
    <Field label={label}>
      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-background p-2">
        {values.map((s) => (
          <Badge key={s} variant="secondary" className="gap-1">
            {s}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          className="flex-1 min-w-[140px] bg-transparent text-sm outline-none"
          placeholder={placeholder ?? "Add and press Enter"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const v = draft.trim();
            if (v && !values.includes(v)) onChange([...values, v]);
            setDraft("");
          }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === "," || e.key === "Tab") && draft.trim()) {
              e.preventDefault();
              const v = draft.trim();
              if (!values.includes(v)) onChange([...values, v]);
              setDraft("");
            }
          }}
        />

      </div>
    </Field>
  );
}
