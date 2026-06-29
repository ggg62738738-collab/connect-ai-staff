// Centralized mock data layer for the admin portal.
// All admin pages read through this module via TanStack Query so the UI is
// already API-shaped — swap these functions for `createServerFn` + Supabase
// reads later without touching components.

export type Freelancer = {
  id: string;
  name: string;
  email: string;
  title: string;
  skills: string[];
  rate: number;
  rating: number;
  status: "active" | "pending" | "suspended";
  joined: string;
  location: string;
  avatarColor: string;
};

export type Company = {
  id: string;
  name: string;
  industry: string;
  size: string;
  contact: string;
  email: string;
  status: "active" | "trial" | "churned";
  plan: "Starter" | "Growth" | "Enterprise";
  spend: number;
  joined: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  type: "Full-time" | "Part-time" | "Contract";
  budget: number;
  applicants: number;
  status: "open" | "filled" | "closed";
  posted: string;
};

export type Application = {
  id: string;
  jobTitle: string;
  company: string;
  freelancer: string;
  stage: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";
  submitted: string;
  match: number;
};

export type Contract = {
  id: string;
  freelancer: string;
  company: string;
  role: string;
  start: string;
  end: string | null;
  value: number;
  status: "active" | "completed" | "draft";
};

export type Payment = {
  id: string;
  invoice: string;
  party: string;
  direction: "in" | "out";
  amount: number;
  status: "paid" | "pending" | "failed";
  date: string;
};

const delay = <T>(value: T, ms = 120) =>
  new Promise<T>((r) => setTimeout(() => r(value), ms));

const COLORS = ["#7c5cff", "#ff8a65", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7"];
const pick = <T>(arr: T[], i: number) => arr[i % arr.length];

const FREELANCERS: Freelancer[] = [
  ["Aarav Patel", "Senior React Engineer", ["React", "TypeScript", "Node"], 95, 4.9, "active", "Bengaluru, IN"],
  ["Sofia Romero", "Product Designer", ["Figma", "Design Systems", "UX"], 80, 4.8, "active", "Lisbon, PT"],
  ["Marcus Lee", "Data Engineer", ["Python", "Airflow", "Snowflake"], 110, 4.7, "active", "Singapore"],
  ["Priya Sharma", "Full-stack Developer", ["Next.js", "Postgres", "AWS"], 90, 4.9, "active", "Bengaluru, IN"],
  ["James O'Connor", "DevOps Engineer", ["Kubernetes", "Terraform", "GCP"], 120, 4.8, "active", "Dublin, IE"],
  ["Nadia Haddad", "Brand Designer", ["Branding", "Illustration"], 70, 4.6, "pending", "Beirut, LB"],
  ["Ethan Wright", "iOS Engineer", ["Swift", "SwiftUI"], 100, 4.7, "active", "Austin, US"],
  ["Lina Müller", "Growth Marketer", ["SEO", "Lifecycle", "Analytics"], 85, 4.5, "active", "Berlin, DE"],
  ["Tomás Álvarez", "ML Engineer", ["PyTorch", "LLMs", "RAG"], 130, 4.9, "active", "Madrid, ES"],
  ["Hana Suzuki", "Content Strategist", ["Editorial", "SEO"], 75, 4.6, "pending", "Tokyo, JP"],
  ["Daniel Okafor", "Backend Engineer", ["Go", "gRPC", "Postgres"], 105, 4.8, "active", "Lagos, NG"],
  ["Yara Costa", "QA Automation Lead", ["Playwright", "Cypress"], 80, 4.7, "suspended", "São Paulo, BR"],
].map((row, i) => {
  const [name, title, skills, rate, rating, status, location] = row as [
    string, string, string[], number, number, Freelancer["status"], string
  ];
  return {
    id: `flr_${1000 + i}`,
    name,
    email: name.toLowerCase().replace(/[^a-z]+/g, ".") + "@talent.io",
    title,
    skills,
    rate,
    rating,
    status,
    joined: `2025-${String((i % 11) + 1).padStart(2, "0")}-${String((i * 3) % 27 + 1).padStart(2, "0")}`,
    location,
    avatarColor: pick(COLORS, i),
  };
});

const COMPANIES: Company[] = [
  ["Northwind Labs", "SaaS", "51-200", "Ava Bennett", "active", "Growth", 48200],
  ["Helios Robotics", "Hardware", "201-500", "Ravi Mehta", "active", "Enterprise", 162000],
  ["Lumen Health", "Healthtech", "11-50", "Mia Chen", "trial", "Starter", 4200],
  ["Atlas Logistics", "Logistics", "501-1000", "Diego Romero", "active", "Enterprise", 224500],
  ["Pixel Foundry", "Agency", "11-50", "Sara Lindgren", "active", "Growth", 31000],
  ["Quanta Finance", "Fintech", "51-200", "Noah Kim", "active", "Growth", 76800],
  ["Verdant AgTech", "Agritech", "11-50", "Olivia Park", "churned", "Starter", 2100],
  ["Orbit Media", "Media", "51-200", "Liam Brown", "trial", "Starter", 1500],
].map((row, i) => {
  const [name, industry, size, contact, status, plan, spend] = row as [
    string, string, string, string, Company["status"], Company["plan"], number
  ];
  return {
    id: `co_${500 + i}`,
    name, industry, size, contact,
    email: "ops@" + name.toLowerCase().replace(/[^a-z]+/g, "") + ".com",
    status, plan, spend,
    joined: `2024-${String((i % 12) + 1).padStart(2, "0")}-15`,
  };
});

const JOBS: Job[] = [
  ["Senior Frontend Engineer", "Northwind Labs", "Contract", 65000, 28, "open"],
  ["Lead Product Designer", "Helios Robotics", "Full-time", 140000, 41, "open"],
  ["Data Platform Engineer", "Atlas Logistics", "Contract", 85000, 14, "open"],
  ["Growth Marketer", "Pixel Foundry", "Part-time", 22000, 19, "filled"],
  ["iOS Engineer", "Quanta Finance", "Contract", 72000, 11, "open"],
  ["DevOps Architect", "Helios Robotics", "Contract", 110000, 8, "open"],
  ["Brand Designer", "Orbit Media", "Part-time", 14000, 22, "closed"],
  ["ML Engineer", "Lumen Health", "Contract", 95000, 17, "open"],
].map((row, i) => {
  const [title, company, type, budget, applicants, status] = row as [
    string, string, Job["type"], number, number, Job["status"]
  ];
  return {
    id: `job_${2000 + i}`,
    title, company, type, budget, applicants, status,
    posted: `2025-${String(((i + 2) % 12) + 1).padStart(2, "0")}-${String((i * 4) % 27 + 1).padStart(2, "0")}`,
  };
});

const APPLICATIONS: Application[] = [
  ["Senior Frontend Engineer", "Northwind Labs", "Aarav Patel", "interview", 96],
  ["Lead Product Designer", "Helios Robotics", "Sofia Romero", "offer", 94],
  ["Data Platform Engineer", "Atlas Logistics", "Marcus Lee", "screening", 89],
  ["iOS Engineer", "Quanta Finance", "Ethan Wright", "applied", 82],
  ["DevOps Architect", "Helios Robotics", "James O'Connor", "interview", 91],
  ["ML Engineer", "Lumen Health", "Tomás Álvarez", "hired", 97],
  ["Growth Marketer", "Pixel Foundry", "Lina Müller", "rejected", 71],
  ["Senior Frontend Engineer", "Northwind Labs", "Priya Sharma", "screening", 88],
  ["Brand Designer", "Orbit Media", "Nadia Haddad", "applied", 78],
].map((row, i) => {
  const [jobTitle, company, freelancer, stage, match] = row as [
    string, string, string, Application["stage"], number
  ];
  return {
    id: `app_${3000 + i}`,
    jobTitle, company, freelancer, stage, match,
    submitted: `2025-06-${String((i * 3) % 27 + 1).padStart(2, "0")}`,
  };
});

const CONTRACTS: Contract[] = [
  ["Aarav Patel", "Northwind Labs", "Senior Frontend Engineer", "2025-04-01", null, 65000, "active"],
  ["Marcus Lee", "Atlas Logistics", "Data Platform Engineer", "2025-03-15", null, 85000, "active"],
  ["Sofia Romero", "Helios Robotics", "Lead Product Designer", "2025-05-10", null, 140000, "active"],
  ["Tomás Álvarez", "Lumen Health", "ML Engineer", "2025-01-08", "2025-06-30", 95000, "completed"],
  ["Lina Müller", "Pixel Foundry", "Growth Marketer", "2024-11-01", "2025-04-30", 22000, "completed"],
  ["Daniel Okafor", "Quanta Finance", "Backend Engineer", "2025-06-15", null, 78000, "draft"],
].map((row, i) => {
  const [freelancer, company, role, start, end, value, status] = row as [
    string, string, string, string, string | null, number, Contract["status"]
  ];
  return { id: `ctr_${4000 + i}`, freelancer, company, role, start, end, value, status };
});

const PAYMENTS: Payment[] = [
  ["INV-2025-0142", "Northwind Labs", "in", 16250, "paid", "2025-06-20"],
  ["INV-2025-0143", "Helios Robotics", "in", 35000, "paid", "2025-06-21"],
  ["PAY-2025-0088", "Aarav Patel", "out", 14200, "paid", "2025-06-22"],
  ["PAY-2025-0089", "Sofia Romero", "out", 30600, "pending", "2025-06-23"],
  ["INV-2025-0144", "Atlas Logistics", "in", 21250, "pending", "2025-06-24"],
  ["PAY-2025-0090", "Marcus Lee", "out", 18500, "paid", "2025-06-25"],
  ["INV-2025-0145", "Lumen Health", "in", 9500, "failed", "2025-06-26"],
  ["PAY-2025-0091", "Tomás Álvarez", "out", 8300, "paid", "2025-06-27"],
].map((row, i) => {
  const [invoice, party, direction, amount, status, date] = row as [
    string, string, Payment["direction"], number, Payment["status"], string
  ];
  return { id: `pmt_${5000 + i}`, invoice, party, direction, amount, status, date };
});

export const adminApi = {
  metrics: () => delay({
    revenue: 412800,
    revenueDelta: 12.4,
    activeFreelancers: FREELANCERS.filter((f) => f.status === "active").length,
    activeFreelancersDelta: 8.1,
    activeCompanies: COMPANIES.filter((c) => c.status === "active").length,
    activeCompaniesDelta: 4.3,
    openJobs: JOBS.filter((j) => j.status === "open").length,
    openJobsDelta: -2.1,
    placements: APPLICATIONS.filter((a) => a.stage === "hired").length + 17,
    fillRate: 71,
    avgTimeToHire: 9,
  }),
  revenueSeries: () => delay([
    { month: "Jan", revenue: 184000, placements: 12 },
    { month: "Feb", revenue: 212000, placements: 14 },
    { month: "Mar", revenue: 248000, placements: 18 },
    { month: "Apr", revenue: 296000, placements: 22 },
    { month: "May", revenue: 358000, placements: 27 },
    { month: "Jun", revenue: 412800, placements: 31 },
  ]),
  pipeline: () => delay([
    { stage: "Applied", count: 184 },
    { stage: "Screening", count: 96 },
    { stage: "Interview", count: 48 },
    { stage: "Offer", count: 19 },
    { stage: "Hired", count: 12 },
  ]),
  activity: () => delay([
    { id: 1, who: "Sofia Romero", what: "accepted an offer at Helios Robotics", when: "2m ago", tone: "success" },
    { id: 2, who: "Northwind Labs", what: "posted a new role: Senior Frontend Engineer", when: "18m ago", tone: "info" },
    { id: 3, who: "Marcus Lee", what: "submitted timesheet for Atlas Logistics", when: "1h ago", tone: "info" },
    { id: 4, who: "Lumen Health", what: "invoice INV-2025-0145 failed", when: "3h ago", tone: "warning" },
    { id: 5, who: "Tomás Álvarez", what: "completed contract with Lumen Health", when: "Today", tone: "success" },
    { id: 6, who: "Nadia Haddad", what: "pending vetting review", when: "Today", tone: "warning" },
  ] as Array<{ id: number; who: string; what: string; when: string; tone: "success" | "info" | "warning" }>),
  freelancers: () => delay(FREELANCERS),
  companies: () => delay(COMPANIES),
  jobs: () => delay(JOBS),
  applications: () => delay(APPLICATIONS),
  contracts: () => delay(CONTRACTS),
  payments: () => delay(PAYMENTS),
};

export const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();