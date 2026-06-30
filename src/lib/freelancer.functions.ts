import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type OpenJob = {
  id: string;
  title: string;
  company: string;
  type: "Full-time" | "Part-time" | "Contract";
  budget: number;
  description: string | null;
  postedAt: string;
  hasApplied: boolean;
};

export type MyApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  stage: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";
  match: number;
  submittedAt: string;
};

export type MyContract = {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string | null;
  value: number;
  status: "active" | "completed" | "draft";
};

export type MyPayout = {
  id: string;
  invoice: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  date: string;
};

export type FreelancerProfile = {
  title: string;
  bio: string;
  skills: string[];
  rate: number;
  location: string;
  availability: string;
  status: "active" | "pending" | "suspended";
  rating: number;
  fullName: string;
  headline: string;
};

const dateOnly = (iso: string | null) => (iso ?? "").slice(0, 10);

export const listOpenJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OpenJob[]> => {
    const { data, error } = await context.supabase
      .from("jobs")
      .select("id, title, type, budget, description, created_at, companies(name)")
      .eq("status", "open")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: mine } = await context.supabase
      .from("applications").select("job_id").eq("freelancer_id", context.userId);
    const applied = new Set((mine ?? []).map((a: any) => a.job_id));
    return (data ?? []).map((j: any) => ({
      id: j.id, title: j.title, company: j.companies?.name ?? "—",
      type: j.type, budget: Number(j.budget ?? 0),
      description: j.description, postedAt: dateOnly(j.created_at),
      hasApplied: applied.has(j.id),
    }));
  });

export const applyToJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { jobId: string; coverLetter?: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("applications").insert({
      job_id: data.jobId,
      freelancer_id: context.userId,
      cover_letter: data.coverLetter ?? null,
      match: 75,
    });
    if (error) {
      if (error.code === "23505") throw new Error("You've already applied to this role.");
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const withdrawApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("applications").delete().eq("id", data.id).eq("freelancer_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyApplication[]> => {
    const { data, error } = await context.supabase
      .from("applications")
      .select("id, job_id, stage, match, submitted_at, jobs(title, companies(name))")
      .eq("freelancer_id", context.userId)
      .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((a: any) => ({
      id: a.id, jobId: a.job_id,
      jobTitle: a.jobs?.title ?? "—",
      company: a.jobs?.companies?.name ?? "—",
      stage: a.stage, match: Number(a.match ?? 0),
      submittedAt: dateOnly(a.submitted_at),
    }));
  });

export const listMyContracts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyContract[]> => {
    const { data, error } = await context.supabase
      .from("contracts")
      .select("id, role, start_date, end_date, value, status, companies(name)")
      .eq("freelancer_id", context.userId)
      .order("start_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((c: any) => ({
      id: c.id, company: c.companies?.name ?? "—", role: c.role,
      start: c.start_date, end: c.end_date, value: Number(c.value ?? 0), status: c.status,
    }));
  });

export const listMyPayouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyPayout[]> => {
    const { data, error } = await context.supabase
      .from("payments")
      .select("id, invoice, amount, status, paid_on")
      .eq("party_user_id", context.userId)
      .eq("direction", "out")
      .order("paid_on", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((p: any) => ({
      id: p.id, invoice: p.invoice, amount: Number(p.amount),
      status: p.status, date: dateOnly(p.paid_on),
    }));
  });

export const getMyFreelancerProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FreelancerProfile> => {
    const [{ data: fp }, { data: prof }] = await Promise.all([
      context.supabase
        .from("freelancer_profiles")
        .select("title, bio, skills, rate, location, availability, status, rating")
        .eq("user_id", context.userId).maybeSingle(),
      context.supabase
        .from("profiles").select("full_name, headline").eq("id", context.userId).maybeSingle(),
    ]);
    return {
      title: fp?.title ?? "",
      bio: fp?.bio ?? "",
      skills: fp?.skills ?? [],
      rate: Number(fp?.rate ?? 0),
      location: fp?.location ?? "",
      availability: fp?.availability ?? "",
      status: (fp?.status as any) ?? "pending",
      rating: Number(fp?.rating ?? 0),
      fullName: prof?.full_name ?? "",
      headline: prof?.headline ?? "",
    };
  });

export const updateMyFreelancerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Partial<FreelancerProfile>) => d)
  .handler(async ({ data, context }) => {
    if (data.fullName !== undefined || data.headline !== undefined) {
      const { error } = await context.supabase
        .from("profiles")
        .update({
          ...(data.fullName !== undefined ? { full_name: data.fullName } : {}),
          ...(data.headline !== undefined ? { headline: data.headline } : {}),
        })
        .eq("id", context.userId);
      if (error) throw new Error(error.message);
    }
    const fp: {
      title?: string; bio?: string; skills?: string[]; rate?: number;
      location?: string; availability?: string;
    } = {};
    if (data.title !== undefined) fp.title = data.title;
    if (data.bio !== undefined) fp.bio = data.bio;
    if (data.skills !== undefined) fp.skills = data.skills;
    if (data.rate !== undefined) fp.rate = data.rate;
    if (data.location !== undefined) fp.location = data.location;
    if (data.availability !== undefined) fp.availability = data.availability;
    if (Object.keys(fp).length) {
      const { error } = await context.supabase
        .from("freelancer_profiles").update(fp as any).eq("user_id", context.userId);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const getFreelancerMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [apps, contracts, payouts] = await Promise.all([
      context.supabase.from("applications").select("stage").eq("freelancer_id", context.userId),
      context.supabase.from("contracts").select("status, value").eq("freelancer_id", context.userId),
      context.supabase.from("payments").select("amount, status").eq("party_user_id", context.userId).eq("direction", "out"),
    ]);
    const activeContracts = (contracts.data ?? []).filter((c: any) => c.status === "active").length;
    const earnings = (payouts.data ?? []).filter((p: any) => p.status === "paid")
      .reduce((s: number, p: any) => s + Number(p.amount), 0);
    const pending = (payouts.data ?? []).filter((p: any) => p.status === "pending")
      .reduce((s: number, p: any) => s + Number(p.amount), 0);
    return {
      totalApplications: (apps.data ?? []).length,
      activeApplications: (apps.data ?? []).filter((a: any) => !["hired", "rejected"].includes(a.stage)).length,
      activeContracts, earnings, pendingPayouts: pending,
    };
  });