import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type OnboardingData = {
  // 1. Basic
  fullName?: string;
  photoUrl?: string;
  email?: string;
  mobile?: string;
  mobileVerified?: boolean;
  emailVerified?: boolean;
  dob?: string;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  nationality?: string;
  languages?: string[];

  // 2. Professional
  registerAs?: "professional" | "freelancer" | "student" | "fresher";
  primaryRole?: string;
  secondaryRole?: string;
  currentCompany?: string;
  currentDesignation?: string;
  totalExperience?: number;
  relevantExperience?: number;
  industry?: string;
  employmentStatus?: "employed" | "freelancer" | "looking" | "student";
  availableFrom?: string;
  workMode?: ("remote" | "hybrid" | "onsite")[];
  preferredShift?: string;
  preferredCountries?: string[];

  // 3. Skills
  skills?: { name: string; level: number; years?: number }[];
  primarySkill?: string;
  secondarySkill?: string;

  // 4. Resume
  resumeUrl?: string;
  coverLetterUrl?: string;
  links?: {
    linkedin?: string; github?: string; portfolio?: string;
    behance?: string; dribbble?: string; stackoverflow?: string;
    medium?: string; website?: string;
  };

  // 5. Experience
  experience?: {
    company: string; designation: string; type?: string;
    startDate?: string; endDate?: string; current?: boolean;
    tech?: string; responsibilities?: string; achievements?: string;
  }[];

  // 6. Education
  education?: {
    degree: string; college: string; university?: string;
    branch?: string; gradYear?: string; cgpa?: string; percentage?: string;
  }[];

  // 7. Certs
  certifications?: {
    name: string; issuer?: string; issueDate?: string; expiry?: string; url?: string;
  }[];

  // 8. Projects
  projects?: {
    name: string; client?: string; duration?: string; teamSize?: string;
    role?: string; tech?: string; description?: string; github?: string; demo?: string;
  }[];

  // 9. Job preferences
  expectedDailyRate?: number;
  expectedHourlyRate?: number;
  expectedMonthlySalary?: number;
  minBudget?: number;
  preferredTech?: string[];
  preferredIndustry?: string;
  preferredLocation?: string;
  remoteOnly?: boolean;
  contractDuration?: string;
  noticePeriod?: "immediate" | "15" | "30" | "60" | "90";

  // 10. Verification
  aadhaar?: string;
  pan?: string;
  passport?: string;
  companyIdUrl?: string;
  offerLetterUrl?: string;
  experienceLetterUrl?: string;

  // Students
  studentCollege?: string;
  studentDegree?: string;
  studentBranch?: string;
  studentYear?: string;
  studentGradYear?: string;
  internshipLookingFor?: string;
  hackathons?: string;
  leetcode?: string;
  hackerrank?: string;
  codingPlatforms?: string;

  // Availability
  availabilityStatus?: "immediate" | "15days" | "30days";
  hoursPerDay?: number;
  canTravel?: boolean;
  canRelocate?: boolean;
  passportAvailable?: boolean;
  laptopAvailable?: boolean;
  internetSpeed?: string;
  timezone?: string;
};

export type OnboardingRecord = {
  data: OnboardingData;
  completion: number;
  talentScore: number;
  recruiterNotes?: string | null;
  recruiterAssessment?: Record<string, any>;
};

const SECTION_KEYS: (keyof OnboardingData)[][] = [
  ["fullName", "email", "mobile", "city", "country"],
  ["primaryRole", "totalExperience", "employmentStatus", "workMode"],
  ["skills", "primarySkill"],
  ["resumeUrl", "links"],
  ["experience"],
  ["education"],
  ["certifications"],
  ["projects"],
  ["expectedHourlyRate", "noticePeriod"],
  ["aadhaar", "pan"],
];

function calcCompletion(d: OnboardingData) {
  let done = 0;
  let total = 0;
  for (const sect of SECTION_KEYS) {
    for (const k of sect) {
      total++;
      const v = (d as any)[k];
      if (Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== "")
        done++;
    }
  }
  return Math.round((done / total) * 100);
}

function calcTalentScore(d: OnboardingData, completion: number, assessment: any) {
  let score = Math.round(completion * 0.35); // up to 35 from completeness
  score += Math.min((d.experience?.length ?? 0) * 5, 15);
  score += Math.min((d.projects?.length ?? 0) * 4, 12);
  score += Math.min((d.certifications?.length ?? 0) * 3, 9);
  if (d.resumeUrl) score += 5;
  if (d.mobileVerified) score += 3;
  if (d.emailVerified) score += 3;
  if (assessment?.verified) score += 8;
  if (assessment?.interviewCompleted) score += 5;
  if (assessment?.deployable) score += 5;
  return Math.min(score, 100);
}

export const getMyOnboarding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OnboardingRecord> => {
    const { data, error } = await context.supabase
      .from("freelancer_onboarding")
      .select("data, completion, talent_score, recruiter_notes, recruiter_assessment")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      data: (data?.data as OnboardingData) ?? {},
      completion: data?.completion ?? 0,
      talentScore: data?.talent_score ?? 0,
      recruiterNotes: data?.recruiter_notes ?? null,
      recruiterAssessment: (data?.recruiter_assessment as any) ?? {},
    };
  });

export const saveMyOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { data: OnboardingData }) => d)
  .handler(async ({ data, context }) => {
    const completion = calcCompletion(data.data);
    // fetch existing assessment so freelancer save doesn't wipe it
    const { data: existing } = await context.supabase
      .from("freelancer_onboarding")
      .select("recruiter_assessment")
      .eq("user_id", context.userId)
      .maybeSingle();
    const assessment = (existing?.recruiter_assessment as any) ?? {};
    const talentScore = calcTalentScore(data.data, completion, assessment);

    const { error } = await context.supabase
      .from("freelancer_onboarding")
      .upsert({
        user_id: context.userId,
        data: data.data as any,
        completion,
        talent_score: talentScore,
      }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);

    // mirror high-signal fields into freelancer_profiles for filtering + display
    const d = data.data;
    const fp: any = {
      photo_url: d.photoUrl ?? null,
      mobile: d.mobile ?? null,
      mobile_verified: !!d.mobileVerified,
      email_verified: !!d.emailVerified,
      city: d.city ?? null,
      country: d.country ?? null,
      primary_role: d.primaryRole ?? null,
      total_experience: d.totalExperience ?? null,
      employment_status: d.employmentStatus ?? null,
      notice_period: d.noticePeriod ?? null,
      expected_daily_rate: d.expectedDailyRate ?? null,
      expected_hourly_rate: d.expectedHourlyRate ?? null,
      resume_url: d.resumeUrl ?? null,
      linkedin_url: d.links?.linkedin ?? null,
      github_url: d.links?.github ?? null,
      portfolio_url: d.links?.portfolio ?? null,
      available_from: d.availableFrom ?? null,
      register_as: d.registerAs ?? null,
    };
    if (d.primaryRole) fp.title = d.primaryRole;
    if (d.expectedHourlyRate !== undefined) fp.rate = d.expectedHourlyRate;
    if (d.city || d.country) fp.location = [d.city, d.country].filter(Boolean).join(", ");
    if (d.skills?.length) fp.skills = d.skills.map((s) => s.name);
    await context.supabase
      .from("freelancer_profiles")
      .update(fp)
      .eq("user_id", context.userId);

    // mirror name / phone / avatar into profiles
    const pp: any = {};
    if (d.fullName) pp.full_name = d.fullName;
    if (d.mobile) pp.phone = d.mobile;
    if (d.photoUrl) pp.avatar_url = d.photoUrl;
    if (Object.keys(pp).length) {
      await context.supabase.from("profiles").update(pp).eq("id", context.userId);
    }
    return { ok: true, completion, talentScore };
  });
