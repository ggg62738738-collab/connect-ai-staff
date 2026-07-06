import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Mail, MapPin, Star, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { getFreelancerDetail } from "@/lib/admin.functions";
import { fmtMoney, initials } from "@/lib/admin-data";
import { useState } from "react";

export const Route = createFileRoute("/admin/freelancers/$id")({ component: FreelancerDetailPage });

const SECTIONS = [
  { id: "bio", label: "Bio & profile" },
  { id: "professional", label: "Professional" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "preferences", label: "Preferences & availability" },
  { id: "links", label: "Links" },
  { id: "documents", label: "Documents & verification" },
  { id: "student", label: "Student info" },
  { id: "onboarding", label: "Onboarding progress" },
  { id: "applications", label: "Applications" },
  { id: "contracts", label: "Contracts" },
  { id: "ratings", label: "Ratings & assessment" },
];


function FreelancerDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "freelancer-detail", id],
    queryFn: () => getFreelancerDetail({ data: { userId: id } }),
  });
  const [active, setActive] = useState("bio");

  if (isLoading || !data) {
    return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  const { user, profile, onboarding, applications, contracts } = data;
  const onb: any = onboarding?.data ?? {};
  const category = onb.registerAs === "student" || onb.registerAs === "fresher" ? "Campus" : "Professional";
  const categoryColor = category === "Campus" ? "bg-emerald-100 text-emerald-700" : "bg-violet/15 text-violet";

  return (
    <>
      <PageHeader
        title={user.name}
        subtitle={user.headline || profile?.title || "Talent profile"}
        actions={<Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/freelancers" })}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>}
      />
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[260px_1fr]">
        {/* Fixed sidebar */}
        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              {onb.photoUrl ? (
                <img src={onb.photoUrl} alt={user.name} className="h-12 w-12 rounded-full object-cover border" />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-full bg-violet text-sm font-semibold text-white">{initials(user.name)}</div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <Badge className={categoryColor + " mt-1"}>{category === "Campus" ? "🟢 Campus" : "🟣 Professional"}</Badge>
              </div>
            </div>

          </CardHeader>
          <CardContent className="space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`block w-full rounded-md px-2 py-1.5 text-left text-sm transition ${active === s.id ? "bg-violet/10 text-violet" : "hover:bg-muted"}`}
              >{s.label}</button>
            ))}
            <div className="mt-4 border-t pt-3 text-xs">
              <p className="text-muted-foreground">Talent Score</p>
              <p className="font-display text-2xl">{onboarding?.talentScore ?? 0}<span className="text-sm text-muted-foreground">/100</span></p>
              <Progress value={onboarding?.completion ?? 0} className="mt-2 h-1.5" />
              <p className="mt-1 text-[10px] text-muted-foreground">Profile {onboarding?.completion ?? 0}% complete</p>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="min-w-0 space-y-4">
          {active === "bio" && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Bio & profile</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Info icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={user.email} />
                  <Info icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={profile?.location || onb.city || "—"} />
                  <Info label="Title" value={profile?.title || onb.primaryRole || "—"} />
                  <Info label="Availability" value={profile?.availability || onb.availabilityStatus || "—"} />
                  <Info label="Hourly rate" value={profile?.rate ? `${fmtMoney(profile.rate)}/hr` : "—"} />
                  <Info label="Experience" value={onb.totalExperience ? `${onb.totalExperience} years` : "—"} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Bio</p>
                  <p className="mt-1 whitespace-pre-line">{profile?.bio || "No bio yet."}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {active === "skills" && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Skills</CardTitle></CardHeader>
              <CardContent>
                {(onb.skills?.length ?? 0) === 0 && (profile?.skills?.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">No skills captured yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(onb.skills ?? []).map((s: any, i: number) => (
                      <div key={i} className="flex items-center justify-between rounded-md border p-2 text-sm">
                        <span className="font-medium">{s.name}</span>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map((n) => <Star key={n} className={`h-3.5 w-3.5 ${n <= (s.level ?? 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}
                          {s.years ? <span className="ml-2 text-xs text-muted-foreground">{s.years}y</span> : null}
                        </div>
                      </div>
                    ))}
                    {!(onb.skills?.length) && profile?.skills?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {profile.skills.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
                      </div>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {active === "documents" && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Documents</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <DocRow label="Resume" value={onb.resumeUrl} />
                <DocRow label="Cover letter" value={onb.coverLetterUrl} />
                <DocRow label="Profile photo" value={onb.photoUrl} />
                <DocRow label="Company ID" value={onb.companyIdUrl} />
                <DocRow label="Offer letter" value={onb.offerLetterUrl} />
                <DocRow label="Experience letter" value={onb.experienceLetterUrl} />
                <div className="mt-3 border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Government IDs</p>
                  <p className="text-sm">Aadhaar: {onb.aadhaar ? "•••• " + String(onb.aadhaar).slice(-4) : "—"}</p>
                  <p className="text-sm">PAN: {onb.pan || "—"}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {active === "onboarding" && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Onboarding progress</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Completion</span>
                    <span className="font-display text-2xl">{onboarding?.completion ?? 0}%</span>
                  </div>
                  <Progress value={onboarding?.completion ?? 0} className="mt-2" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                  <SectionCheck label="Basic" done={!!onb.fullName} />
                  <SectionCheck label="Professional" done={!!onb.primaryRole} />
                  <SectionCheck label="Skills" done={(onb.skills?.length ?? 0) > 0} />
                  <SectionCheck label="Resume" done={!!onb.resumeUrl} />
                  <SectionCheck label="Experience" done={(onb.experience?.length ?? 0) > 0} />
                  <SectionCheck label="Education" done={(onb.education?.length ?? 0) > 0} />
                  <SectionCheck label="Certifications" done={(onb.certifications?.length ?? 0) > 0} />
                  <SectionCheck label="Projects" done={(onb.projects?.length ?? 0) > 0} />
                  <SectionCheck label="Verification" done={!!onb.aadhaar || !!onb.pan} />
                </div>
              </CardContent>
            </Card>
          )}

          {active === "applications" && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Applications ({applications.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {applications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No applications yet.</p>
                ) : applications.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.jobTitle}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.company} · {a.submittedAt}</p>
                    </div>
                    <Badge>{a.stage}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === "contracts" && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Contracts</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {contracts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No contracts yet.</p>
                ) : contracts.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.role}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.company} · {c.start} → {c.end ?? "ongoing"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{fmtMoney(c.value)}</p>
                      <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === "ratings" && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Ratings & recruiter assessment</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-lg font-semibold">{profile?.rating ?? 0}</span>
                  <span className="text-muted-foreground">/ 5</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Recruiter notes</p>
                  <p className="mt-1 whitespace-pre-line">{onboarding?.recruiterNotes || "No recruiter notes yet."}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Info({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">{icon}{label}</p>
      <p className="mt-0.5 truncate">{value}</p>
    </div>
  );
}

function DocRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {value ? (
        <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-violet hover:underline">
          View <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-xs text-muted-foreground">Not uploaded</span>
      )}
    </div>
  );
}

function SectionCheck({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-md border px-2 py-1.5 ${done ? "bg-emerald-50 border-emerald-200" : ""}`}>
      <span>{label}</span>
      <span className={done ? "text-emerald-600" : "text-muted-foreground/50"}>{done ? "✓" : "—"}</span>
    </div>
  );
}
