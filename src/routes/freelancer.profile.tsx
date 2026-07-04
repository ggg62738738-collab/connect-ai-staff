import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/admin/page-header";
import { getMyFreelancerProfile } from "@/lib/freelancer.functions";
import { getMyOnboarding } from "@/lib/onboarding.functions";
import { useSignedFileUrl } from "@/lib/use-signed-url";
import { Loader2, Star, ExternalLink, Mail, MapPin, Briefcase, GraduationCap, Award, FolderKanban, ShieldCheck, Pencil } from "lucide-react";

export const Route = createFileRoute("/freelancer/profile")({ component: ProfilePage });


function ProfilePage() {
  const { data, isLoading } = useQuery({ queryKey: ["fl", "profile"], queryFn: () => getMyFreelancerProfile() });
  const { data: onb } = useQuery({ queryKey: ["fl", "onboarding"], queryFn: () => getMyOnboarding() });

  if (isLoading || !data) {
    return (
      <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
    );
  }

  return (
    <>
      <PageHeader title="Profile" subtitle="Keep your details current — this is what clients see." />
      <OnboardingView onb={onb} name={data.fullName} />
    </>
  );
}


function OnboardingView({ onb, name }: { onb: any; name: string }) {
  const d: any = onb?.data ?? {};
  const completion = onb?.completion ?? 0;
  const score = onb?.talentScore ?? 0;
  const has = (v: any) => Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== "";
  const empty = !onb || Object.keys(d).length === 0;
  const { url: heroPhoto } = useSignedFileUrl(d.photoUrl);

  if (empty) {
    return (
      <div className="px-6 pb-8">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-violet/10 text-violet"><ShieldCheck className="h-6 w-6" /></div>
            <div>
              <p className="font-display text-lg">Complete your onboarding</p>
              <p className="mt-1 text-sm text-muted-foreground">Add your experience, education, and preferences to boost your Talent Score.</p>
            </div>
            <Link to="/freelancer/onboarding" className="rounded-full bg-violet px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">Start onboarding</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-6 pb-10">
      {/* Hero */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-violet/25 via-violet/10 to-cream" />
        <CardContent className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            {heroPhoto ? (
              <img src={heroPhoto} alt={name} className="h-24 w-24 rounded-full border-4 border-background object-cover shadow" />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-background bg-violet text-lg font-semibold text-white shadow">{name.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase()}</div>
            )}
            <div className="pb-1">
              <h2 className="font-display text-2xl">{d.fullName || name}</h2>
              <p className="text-sm text-muted-foreground">{d.primaryRole || d.currentDesignation || "Talent"}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {d.email ? <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{d.email}</span> : null}
                {(d.city || d.country) ? <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{[d.city, d.country].filter(Boolean).join(", ")}</span> : null}
                {d.availabilityStatus ? <Badge variant="outline" className="text-[10px]">Available: {d.availabilityStatus}</Badge> : null}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Talent Score</p>
              <p className="font-display text-3xl leading-none">{score}<span className="text-sm text-muted-foreground">/100</span></p>
              <div className="mt-2 w-32">
                <Progress value={completion} className="h-1.5" />
                <p className="mt-1 text-[10px] text-muted-foreground">{completion}% complete</p>
              </div>
            </div>
            <Link to="/freelancer/onboarding" className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium hover:bg-muted">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Skills */}
          {has(d.skills) && (
            <Section title="Skills" icon={<Star className="h-4 w-4" />}>
              <div className="grid gap-2 sm:grid-cols-2">
                {d.skills.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-md border bg-card p-2.5 text-sm">
                    <span className="font-medium">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1,2,3,4,5].map(n => <Star key={n} className={`h-3.5 w-3.5 ${n <= (s.level ?? 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/25"}`} />)}
                      </div>
                      {s.years ? <span className="text-xs text-muted-foreground">{s.years}y</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Experience */}
          {has(d.experience) && (
            <Section title="Experience" icon={<Briefcase className="h-4 w-4" />}>
              <ol className="relative space-y-4 border-l pl-4">
                {d.experience.map((e: any, i: number) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-violet ring-4 ring-background" />
                    <p className="font-medium text-sm">{e.designation} <span className="text-muted-foreground">· {e.company}</span></p>
                    <p className="text-xs text-muted-foreground">{[e.startDate, e.current ? "Present" : e.endDate].filter(Boolean).join(" — ")}{e.type ? ` · ${e.type}` : ""}</p>
                    {e.tech ? <p className="mt-1 text-xs"><span className="text-muted-foreground">Tech:</span> {e.tech}</p> : null}
                    {e.responsibilities ? <p className="mt-1 whitespace-pre-line text-sm">{e.responsibilities}</p> : null}
                    {e.achievements ? <p className="mt-1 text-sm text-muted-foreground"><em>{e.achievements}</em></p> : null}
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* Education */}
          {has(d.education) && (
            <Section title="Education" icon={<GraduationCap className="h-4 w-4" />}>
              <div className="space-y-2">
                {d.education.map((e: any, i: number) => (
                  <div key={i} className="rounded-md border p-3 text-sm">
                    <p className="font-medium">{e.degree}{e.branch ? ` · ${e.branch}` : ""}</p>
                    <p className="text-xs text-muted-foreground">{e.college}{e.university ? ` · ${e.university}` : ""}{e.gradYear ? ` · ${e.gradYear}` : ""}</p>
                    {(e.cgpa || e.percentage) ? <p className="mt-1 text-xs">Score: {e.cgpa ? `CGPA ${e.cgpa}` : `${e.percentage}%`}</p> : null}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Projects */}
          {has(d.projects) && (
            <Section title="Projects" icon={<FolderKanban className="h-4 w-4" />}>
              <div className="grid gap-2 sm:grid-cols-2">
                {d.projects.map((p: any, i: number) => (
                  <div key={i} className="rounded-md border p-3 text-sm">
                    <p className="font-medium">{p.name}</p>
                    {p.role ? <p className="text-xs text-muted-foreground">{p.role}{p.client ? ` · ${p.client}` : ""}</p> : null}
                    {p.tech ? <p className="mt-1 text-xs"><span className="text-muted-foreground">Tech:</span> {p.tech}</p> : null}
                    {p.description ? <p className="mt-1 line-clamp-3 text-xs">{p.description}</p> : null}
                    <div className="mt-2 flex gap-2 text-xs">
                      {p.github ? <a className="text-violet hover:underline inline-flex items-center gap-0.5" href={p.github} target="_blank" rel="noreferrer">GitHub<ExternalLink className="h-3 w-3" /></a> : null}
                      {p.demo ? <a className="text-violet hover:underline inline-flex items-center gap-0.5" href={p.demo} target="_blank" rel="noreferrer">Demo<ExternalLink className="h-3 w-3" /></a> : null}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Certifications */}
          {has(d.certifications) && (
            <Section title="Certifications" icon={<Award className="h-4 w-4" />}>
              <div className="space-y-2">
                {d.certifications.map((c: any, i: number) => (
                  <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2.5 text-sm">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.issuer}{c.issueDate ? ` · ${c.issueDate}` : ""}</p>
                    </div>
                    {c.url ? <a href={c.url} target="_blank" rel="noreferrer" className="text-xs text-violet hover:underline inline-flex items-center gap-0.5">View<ExternalLink className="h-3 w-3" /></a> : null}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Section title="Basics">
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <Stat k="Mobile" v={d.mobile} />
              <Stat k="DOB" v={d.dob} />
              <Stat k="Gender" v={d.gender} />
              <Stat k="Nationality" v={d.nationality} />
              <Stat k="Languages" v={Array.isArray(d.languages) ? d.languages.join(", ") : d.languages} />
              <Stat k="Timezone" v={d.timezone} />
            </dl>
          </Section>

          <Section title="Preferences">
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <Stat k="Hourly rate" v={d.expectedHourlyRate ? `₹${d.expectedHourlyRate}/hr` : undefined} />
              <Stat k="Daily rate" v={d.expectedDailyRate ? `₹${d.expectedDailyRate}` : undefined} />
              <Stat k="Monthly" v={d.expectedMonthlySalary ? `₹${d.expectedMonthlySalary}` : undefined} />
              <Stat k="Notice" v={d.noticePeriod ? `${d.noticePeriod === "immediate" ? "Immediate" : d.noticePeriod + " days"}` : undefined} />
              <Stat k="Work mode" v={Array.isArray(d.workMode) ? d.workMode.join(", ") : d.workMode} />
              <Stat k="Contract" v={d.contractDuration} />
              <Stat k="Remote only" v={d.remoteOnly ? "Yes" : d.remoteOnly === false ? "No" : undefined} />
              <Stat k="Relocate" v={d.canRelocate ? "Yes" : d.canRelocate === false ? "No" : undefined} />
            </dl>
          </Section>

          {(d.links && Object.values(d.links).some(Boolean)) && (
            <Section title="Links">
              <div className="flex flex-wrap gap-2">
                {Object.entries(d.links).filter(([, v]) => v).map(([k, v]) => (
                  <a key={k} href={String(v)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs hover:bg-muted">
                    {k}<ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </Section>
          )}

          <Section title="Verification">
            <div className="space-y-1.5 text-sm">
              <Row label="Aadhaar"><span>{d.aadhaar ? "•••• " + String(d.aadhaar).slice(-4) : "—"}</span></Row>
              <Row label="PAN"><span>{d.pan || "—"}</span></Row>
              <Row label="Passport"><span>{d.passport || "—"}</span></Row>
              <Row label="Resume">{d.resumeUrl ? <a className="text-violet hover:underline text-xs inline-flex items-center gap-0.5" href={d.resumeUrl} target="_blank" rel="noreferrer">View<ExternalLink className="h-3 w-3" /></a> : <span className="text-xs text-muted-foreground">Not uploaded</span>}</Row>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm">{icon}{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Stat({ k, v }: { k: string; v?: React.ReactNode }) {
  return (
    <>
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="truncate text-sm">{v || <span className="text-muted-foreground">—</span>}</dd>
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