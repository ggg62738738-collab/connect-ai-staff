import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type {
  Freelancer, Company, Job, Application, Contract, Payment,
} from "@/lib/admin-data";

async function assertStaff(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => r.role);
  if (!roles.includes("admin") && !roles.includes("recruiter")) {
    throw new Error("Forbidden: admin or recruiter role required");
  }
  return roles as string[];
}

const COLORS = ["#7c5cff", "#ff8a65", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7"];
const pickColor = (s: string) => {
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
};
const dateOnly = (iso: string) => iso?.slice(0, 10) ?? "";

/* ============================= FREELANCERS ============================= */
export const listFreelancers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Freelancer[]> => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("freelancer_profiles")
      .select("id, user_id, title, skills, rate, rating, status, location, created_at, avatar_color, profiles:profiles!freelancer_profiles_user_id_fkey(full_name, email)")
      .order("created_at", { ascending: false });
    if (error) {
      // fallback if FK alias above isn't auto-named — do two queries
      const { data: rows } = await context.supabase
        .from("freelancer_profiles")
        .select("id, user_id, title, skills, rate, rating, status, location, created_at, avatar_color")
        .order("created_at", { ascending: false });
      const ids = (rows ?? []).map((r: any) => r.user_id);
      const { data: profs } = await context.supabase
        .from("profiles").select("id, full_name, email").in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      return (rows ?? []).map((r: any) => {
        const p = map.get(r.user_id) as any;
        const name = p?.full_name ?? p?.email ?? "Unknown";
        return {
          id: r.id, name, email: p?.email ?? "", title: r.title ?? "—",
          skills: r.skills ?? [], rate: Number(r.rate ?? 0), rating: Number(r.rating ?? 0),
          status: r.status, joined: dateOnly(r.created_at), location: r.location ?? "—",
          avatarColor: r.avatar_color ?? pickColor(name),
        };
      });
    }
    return (data ?? []).map((r: any) => {
      const p = r.profiles;
      const name = p?.full_name ?? p?.email ?? "Unknown";
      return {
        id: r.id, name, email: p?.email ?? "", title: r.title ?? "—",
        skills: r.skills ?? [], rate: Number(r.rate ?? 0), rating: Number(r.rating ?? 0),
        status: r.status, joined: dateOnly(r.created_at), location: r.location ?? "—",
        avatarColor: r.avatar_color ?? pickColor(name),
      };
    });
  });

/* ============================= COMPANIES ============================= */
export const listCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Company[]> => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("companies")
      .select("id, name, industry, size, contact_name, email, status, plan, spend, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((c: any) => ({
      id: c.id, name: c.name, industry: c.industry ?? "—", size: c.size ?? "—",
      contact: c.contact_name ?? "—", email: c.email ?? "",
      status: c.status, plan: c.plan, spend: Number(c.spend ?? 0),
      joined: dateOnly(c.created_at),
    }));
  });

/* ============================= JOBS ============================= */
export const listJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Job[]> => {
    await assertStaff(context.supabase, context.userId);
    const { data: jobs, error } = await context.supabase
      .from("jobs")
      .select("id, title, type, budget, status, created_at, company_id, companies(name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (jobs ?? []).map((j: any) => j.id);
    let counts = new Map<string, number>();
    if (ids.length) {
      const { data: apps } = await context.supabase
        .from("applications").select("job_id").in("job_id", ids);
      (apps ?? []).forEach((a: any) => counts.set(a.job_id, (counts.get(a.job_id) ?? 0) + 1));
    }
    return (jobs ?? []).map((j: any) => ({
      id: j.id, title: j.title, company: j.companies?.name ?? "—",
      type: j.type, budget: Number(j.budget ?? 0),
      applicants: counts.get(j.id) ?? 0,
      status: j.status, posted: dateOnly(j.created_at),
    }));
  });

/* ============================= APPLICATIONS ============================= */
export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Application[]> => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("applications")
      .select("id, job_id, freelancer_id, stage, match, submitted_at, recruiter_id, jobs(title, companies(name))")
      .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    const userIds = Array.from(new Set([
      ...(data ?? []).map((a: any) => a.freelancer_id),
      ...(data ?? []).map((a: any) => a.recruiter_id).filter(Boolean),
    ]));
    const { data: profs } = userIds.length
      ? await context.supabase.from("profiles").select("id, full_name, email").in("id", userIds)
      : { data: [] as any[] };
    const nameMap = new Map((profs ?? []).map((p: any) => [p.id, p.full_name ?? p.email ?? "Unknown"]));
    return (data ?? []).map((a: any) => ({
      id: a.id,
      jobTitle: a.jobs?.title ?? "—",
      company: a.jobs?.companies?.name ?? "—",
      freelancer: nameMap.get(a.freelancer_id) ?? "Unknown",
      stage: a.stage,
      submitted: dateOnly(a.submitted_at),
      match: Number(a.match ?? 0),
    }));
  });

export type ApplicationDetail = Application & {
  freelancerId: string;
  jobId: string;
  recruiterId: string | null;
  recruiterName: string | null;
};

export const listApplicationsDetailed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ApplicationDetail[]> => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("applications")
      .select("id, job_id, freelancer_id, stage, match, submitted_at, recruiter_id, jobs(title, companies(name))")
      .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    const userIds = Array.from(new Set([
      ...(data ?? []).map((a: any) => a.freelancer_id),
      ...(data ?? []).map((a: any) => a.recruiter_id).filter(Boolean),
    ]));
    const { data: profs } = userIds.length
      ? await context.supabase.from("profiles").select("id, full_name, email").in("id", userIds)
      : { data: [] as any[] };
    const nameMap = new Map((profs ?? []).map((p: any) => [p.id, p.full_name ?? p.email ?? "Unknown"]));
    return (data ?? []).map((a: any) => ({
      id: a.id,
      jobTitle: a.jobs?.title ?? "—",
      company: a.jobs?.companies?.name ?? "—",
      freelancer: nameMap.get(a.freelancer_id) ?? "Unknown",
      freelancerId: a.freelancer_id,
      jobId: a.job_id,
      stage: a.stage,
      submitted: dateOnly(a.submitted_at),
      match: Number(a.match ?? 0),
      recruiterId: a.recruiter_id,
      recruiterName: a.recruiter_id ? (nameMap.get(a.recruiter_id) ?? null) : null,
    }));
  });

export const updateApplicationStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; stage: Application["stage"] }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("applications").update({ stage: data.stage }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const assignRecruiter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; recruiterId: string | null }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("applications").update({ recruiter_id: data.recruiterId }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data: roles } = await context.supabase
      .from("user_roles").select("user_id, role").in("role", ["admin", "recruiter"]);
    const ids = Array.from(new Set((roles ?? []).map((r: any) => r.user_id)));
    if (!ids.length) return [] as Array<{ id: string; name: string; role: string }>;
    const { data: profs } = await context.supabase
      .from("profiles").select("id, full_name, email").in("id", ids);
    const roleMap = new Map<string, string>();
    (roles ?? []).forEach((r: any) => {
      // prefer admin label if both
      if (r.role === "admin" || !roleMap.has(r.user_id)) roleMap.set(r.user_id, r.role);
    });
    return (profs ?? []).map((p: any) => ({
      id: p.id, name: p.full_name ?? p.email ?? "Unknown", role: roleMap.get(p.id) ?? "recruiter",
    }));
  });

export const listApplicationNotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { applicationId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data: notes, error } = await context.supabase
      .from("application_notes")
      .select("id, body, author_id, created_at")
      .eq("application_id", data.applicationId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((notes ?? []).map((n: any) => n.author_id)));
    const { data: profs } = ids.length
      ? await context.supabase.from("profiles").select("id, full_name, email").in("id", ids)
      : { data: [] as any[] };
    const nameMap = new Map((profs ?? []).map((p: any) => [p.id, p.full_name ?? p.email ?? "Unknown"]));
    return (notes ?? []).map((n: any) => ({
      id: n.id, body: n.body, createdAt: n.created_at,
      authorId: n.author_id, authorName: nameMap.get(n.author_id) ?? "Unknown",
    }));
  });

export const addApplicationNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { applicationId: string; body: string }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const body = data.body.trim();
    if (!body) throw new Error("Note cannot be empty");
    const { error } = await context.supabase
      .from("application_notes")
      .insert({ application_id: data.applicationId, body, author_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============================= CONTRACTS ============================= */
export const listContracts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Contract[]> => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("contracts")
      .select("id, role, start_date, end_date, value, status, freelancer_id, companies(name)")
      .order("start_date", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((data ?? []).map((c: any) => c.freelancer_id)));
    const { data: profs } = ids.length
      ? await context.supabase.from("profiles").select("id, full_name, email").in("id", ids)
      : { data: [] as any[] };
    const nameMap = new Map((profs ?? []).map((p: any) => [p.id, p.full_name ?? p.email ?? "Unknown"]));
    return (data ?? []).map((c: any) => ({
      id: c.id,
      freelancer: nameMap.get(c.freelancer_id) ?? "Unknown",
      company: c.companies?.name ?? "—",
      role: c.role,
      start: c.start_date, end: c.end_date,
      value: Number(c.value ?? 0), status: c.status,
    }));
  });

/* ============================= PAYMENTS ============================= */
export const listPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Payment[]> => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("payments")
      .select("id, invoice, party, direction, amount, status, paid_on")
      .order("paid_on", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((p: any) => ({
      id: p.id, invoice: p.invoice, party: p.party, direction: p.direction,
      amount: Number(p.amount), status: p.status, date: dateOnly(p.paid_on),
    }));
  });

/* ============================= METRICS ============================= */
export const getMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const [pays, freelancers, companies, jobs, hires] = await Promise.all([
      context.supabase.from("payments").select("amount, direction, status, paid_on"),
      context.supabase.from("freelancer_profiles").select("status"),
      context.supabase.from("companies").select("status"),
      context.supabase.from("jobs").select("status"),
      context.supabase.from("applications").select("id").eq("stage", "hired"),
    ]);
    const revenue = (pays.data ?? [])
      .filter((p: any) => p.direction === "in" && p.status === "paid")
      .reduce((s: number, p: any) => s + Number(p.amount), 0);
    return {
      revenue, revenueDelta: 12.4,
      activeFreelancers: (freelancers.data ?? []).filter((f: any) => f.status === "active").length,
      activeFreelancersDelta: 8.1,
      activeCompanies: (companies.data ?? []).filter((c: any) => c.status === "active").length,
      activeCompaniesDelta: 4.3,
      openJobs: (jobs.data ?? []).filter((j: any) => j.status === "open").length,
      openJobsDelta: -2.1,
      placements: (hires.data ?? []).length,
      fillRate: 71,
      avgTimeToHire: 9,
    };
  });

export const getRevenueSeries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("payments")
      .select("amount, direction, status, paid_on")
      .eq("direction", "in").eq("status", "paid");
    const months: Record<string, { revenue: number; placements: number }> = {};
    (data ?? []).forEach((p: any) => {
      const key = (p.paid_on as string).slice(0, 7);
      months[key] ??= { revenue: 0, placements: 0 };
      months[key].revenue += Number(p.amount);
    });
    const keys = Object.keys(months).sort();
    const fmt = new Intl.DateTimeFormat("en-US", { month: "short" });
    return keys.map((k) => ({
      month: fmt.format(new Date(k + "-01")),
      revenue: months[k].revenue,
      placements: months[k].placements,
    }));
  });

export const getPipeline = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data } = await context.supabase.from("applications").select("stage");
    const buckets: Record<string, number> = { applied: 0, screening: 0, interview: 0, offer: 0, hired: 0 };
    (data ?? []).forEach((a: any) => { if (a.stage in buckets) buckets[a.stage]++; });
    return [
      { stage: "Applied", count: buckets.applied },
      { stage: "Screening", count: buckets.screening },
      { stage: "Interview", count: buckets.interview },
      { stage: "Offer", count: buckets.offer },
      { stage: "Hired", count: buckets.hired },
    ];
  });

export const getActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    // Use most-recent payments and applications as a lightweight feed.
    const [{ data: pays }, { data: apps }] = await Promise.all([
      context.supabase.from("payments").select("invoice, party, status, paid_on").order("paid_on", { ascending: false }).limit(3),
      context.supabase.from("applications").select("id, stage, updated_at, freelancer_id, jobs(title, companies(name))").order("updated_at", { ascending: false }).limit(3),
    ]);
    const ids = Array.from(new Set((apps ?? []).map((a: any) => a.freelancer_id)));
    const { data: profs } = ids.length
      ? await context.supabase.from("profiles").select("id, full_name, email").in("id", ids)
      : { data: [] as any[] };
    const nameMap = new Map((profs ?? []).map((p: any) => [p.id, p.full_name ?? p.email ?? "Unknown"]));
    const out: Array<{ id: number; who: string; what: string; when: string; tone: "success" | "info" | "warning" }> = [];
    let i = 1;
    (apps ?? []).forEach((a: any) => {
      out.push({
        id: i++,
        who: nameMap.get(a.freelancer_id) ?? "Candidate",
        what: `moved to ${a.stage} on ${a.jobs?.title ?? "a role"}${a.jobs?.companies?.name ? " at " + a.jobs.companies.name : ""}`,
        when: dateOnly(a.updated_at),
        tone: a.stage === "hired" ? "success" : a.stage === "rejected" ? "warning" : "info",
      });
    });
    (pays ?? []).forEach((p: any) => {
      out.push({
        id: i++,
        who: p.party,
        what: `${p.status === "failed" ? "invoice failed" : p.status === "pending" ? "invoice pending" : "paid invoice"} ${p.invoice}`,
        when: dateOnly(p.paid_on),
        tone: p.status === "failed" ? "warning" : p.status === "pending" ? "info" : "success",
      });
    });
    return out;
  });

/* ============================= JOB AUTHORING ============================= */
export const listCompaniesLite = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("companies").select("id, name").order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<{ id: string; name: string }>;
  });

export const adminCreateJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    title: string; companyId: string; type: "Full-time" | "Part-time" | "Contract";
    budget: number; description?: string;
  }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    if (!data.title.trim()) throw new Error("Title required");
    if (!data.companyId) throw new Error("Company required");
    const { error } = await context.supabase.from("jobs").insert({
      title: data.title.trim(),
      company_id: data.companyId,
      type: data.type,
      budget: data.budget,
      description: data.description ?? null,
      status: "open",
      posted_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateJobStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "open" | "filled" | "closed" }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("jobs").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============================= TIMESHEETS (admin) ============================= */
export type AdminTimesheet = {
  id: string;
  contractId: string;
  freelancer: string;
  freelancerId: string;
  company: string;
  role: string;
  weekStart: string;
  hours: number;
  notes: string | null;
  status: "draft" | "submitted" | "approved" | "rejected";
  reviewedAt: string | null;
  reviewNotes: string | null;
};

export const listTimesheetsForReview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminTimesheet[]> => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("timesheets")
      .select("id, contract_id, freelancer_id, week_start, hours, notes, status, reviewed_at, review_notes, contracts(role, companies(name))")
      .order("week_start", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((data ?? []).map((t: any) => t.freelancer_id)));
    const { data: profs } = ids.length
      ? await context.supabase.from("profiles").select("id, full_name, email").in("id", ids)
      : { data: [] as any[] };
    const nameMap = new Map((profs ?? []).map((p: any) => [p.id, p.full_name ?? p.email ?? "Unknown"]));
    return (data ?? []).map((t: any) => ({
      id: t.id, contractId: t.contract_id, freelancerId: t.freelancer_id,
      freelancer: nameMap.get(t.freelancer_id) ?? "Unknown",
      company: t.contracts?.companies?.name ?? "—",
      role: t.contracts?.role ?? "—",
      weekStart: t.week_start, hours: Number(t.hours ?? 0),
      notes: t.notes, status: t.status,
      reviewedAt: t.reviewed_at, reviewNotes: t.review_notes,
    }));
  });

export const reviewTimesheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "approved" | "rejected"; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase.from("timesheets").update({
      status: data.status,
      reviewed_by: context.userId,
      reviewed_at: new Date().toISOString(),
      review_notes: data.notes ?? null,
    }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============================= JOB DETAIL + APPLICANTS ============================= */
export type JobDetail = {
  id: string;
  title: string;
  company: string;
  companyId: string | null;
  type: string;
  budget: number;
  status: string;
  description: string | null;
  postedAt: string;
  applicantsCount: number;
  hiredCount: number;
  inPipeline: number;
};

export const getJobDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }): Promise<JobDetail> => {
    await assertStaff(context.supabase, context.userId);
    const { data: j, error } = await context.supabase
      .from("jobs")
      .select("id, title, type, budget, status, description, created_at, company_id, companies(name)")
      .eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!j) throw new Error("Job not found");
    const { data: apps } = await context.supabase
      .from("applications").select("stage").eq("job_id", data.id);
    const list = apps ?? [];
    return {
      id: j.id, title: j.title, company: (j as any).companies?.name ?? "—",
      companyId: (j as any).company_id, type: j.type, budget: Number(j.budget ?? 0),
      status: j.status, description: j.description, postedAt: dateOnly(j.created_at),
      applicantsCount: list.length,
      hiredCount: list.filter((a: any) => a.stage === "hired").length,
      inPipeline: list.filter((a: any) => !["hired", "rejected"].includes(a.stage)).length,
    };
  });

export const listJobApplicants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { jobId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data: apps, error } = await context.supabase
      .from("applications")
      .select("id, freelancer_id, stage, match, submitted_at, cover_letter")
      .eq("job_id", data.jobId)
      .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (apps ?? []).map((a: any) => a.freelancer_id);
    const [{ data: profs }, { data: fps }] = await Promise.all([
      ids.length ? context.supabase.from("profiles").select("id, full_name, email").in("id", ids) : Promise.resolve({ data: [] as any[] }),
      ids.length ? context.supabase.from("freelancer_profiles").select("user_id, title, skills, rate, rating").in("user_id", ids) : Promise.resolve({ data: [] as any[] }),
    ]);
    const pMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
    const fMap = new Map((fps ?? []).map((f: any) => [f.user_id, f]));
    return (apps ?? []).map((a: any) => {
      const p: any = pMap.get(a.freelancer_id);
      const f: any = fMap.get(a.freelancer_id);
      return {
        id: a.id, freelancerId: a.freelancer_id,
        name: p?.full_name ?? p?.email ?? "Unknown", email: p?.email ?? "",
        title: f?.title ?? "—", skills: f?.skills ?? [], rate: Number(f?.rate ?? 0),
        rating: Number(f?.rating ?? 0), stage: a.stage, match: Number(a.match ?? 0),
        submittedAt: dateOnly(a.submitted_at), coverLetter: a.cover_letter,
      };
    });
  });

/* ============================= FREELANCER DETAIL ============================= */
export const getFreelancerDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const [{ data: prof }, { data: fp }, { data: onb }, { data: apps }, { data: contracts }] = await Promise.all([
      context.supabase.from("profiles").select("id, full_name, email, headline").eq("id", data.userId).maybeSingle(),
      context.supabase.from("freelancer_profiles").select("*").eq("user_id", data.userId).maybeSingle(),
      context.supabase.from("freelancer_onboarding").select("data, completion, talent_score, recruiter_notes, recruiter_assessment").eq("user_id", data.userId).maybeSingle(),
      context.supabase.from("applications").select("id, stage, match, submitted_at, jobs(title, companies(name))").eq("freelancer_id", data.userId).order("submitted_at", { ascending: false }),
      context.supabase.from("contracts").select("id, role, start_date, end_date, value, status, companies(name)").eq("freelancer_id", data.userId).order("start_date", { ascending: false }),
    ]);
    return {
      user: { id: data.userId, name: prof?.full_name ?? prof?.email ?? "Unknown", email: prof?.email ?? "", headline: prof?.headline ?? "" },
      profile: fp ?? null,
      onboarding: onb ? { data: onb.data as any, completion: onb.completion ?? 0, talentScore: onb.talent_score ?? 0, recruiterNotes: onb.recruiter_notes, recruiterAssessment: onb.recruiter_assessment as any } : null,
      applications: (apps ?? []).map((a: any) => ({
        id: a.id, jobTitle: a.jobs?.title ?? "—", company: a.jobs?.companies?.name ?? "—",
        stage: a.stage, match: Number(a.match ?? 0), submittedAt: dateOnly(a.submitted_at),
      })),
      contracts: (contracts ?? []).map((c: any) => ({
        id: c.id, role: c.role, company: c.companies?.name ?? "—",
        start: c.start_date, end: c.end_date, value: Number(c.value ?? 0), status: c.status,
      })),
    };
  });

export const saveRecruiterAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; notes?: string; assessment?: Record<string, any> }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const patch: any = {};
    if (data.notes !== undefined) patch.recruiter_notes = data.notes;
    if (data.assessment !== undefined) patch.recruiter_assessment = data.assessment;
    const { error } = await context.supabase
      .from("freelancer_onboarding")
      .upsert({ user_id: data.userId, ...patch }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
