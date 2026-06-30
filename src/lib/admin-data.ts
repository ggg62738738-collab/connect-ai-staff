// Type definitions + adminApi facade. Backed by Supabase via createServerFn.
// Pages read through this module via TanStack Query so swapping/extending
// the data layer remains a single edit point.
import {
  listFreelancers, listCompanies, listJobs, listApplications,
  listContracts, listPayments, getMetrics, getRevenueSeries,
  getPipeline, getActivity,
} from "@/lib/admin.functions";

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
export const adminApi = {
  metrics: () => getMetrics(),
  revenueSeries: () => getRevenueSeries(),
  pipeline: () => getPipeline(),
  activity: () => getActivity(),
  freelancers: () => listFreelancers(),
  companies: () => listCompanies(),
  jobs: () => listJobs(),
  applications: () => listApplications(),
  contracts: () => listContracts(),
  payments: () => listPayments(),
};

export const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();