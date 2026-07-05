import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHero } from "@/components/site/page-shell";
import { ArrowRight, Zap, ShieldCheck, Clock, LineChart, Users, Wallet, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/for-companies")({
  head: () => ({
    meta: [
      { title: "Hire vetted freelancers in India — Workvia for Companies" },
      { name: "description", content: "Hire vetted Indian freelancers, students and professionals on demand. AI-matched shortlists in 48 hours. Contracts, timesheets and payouts in one place." },
      { name: "keywords", content: "hire freelancers India, freelance recruitment, remote hiring India, staff augmentation, workvia for companies" },
      { property: "og:title", content: "Hire vetted freelancers in India — Workvia" },
      { property: "og:description", content: "AI-matched Indian talent in 48 hours. Managed contracts, timesheets and payouts." },
      { property: "og:url", content: "https://workvia.upcurv.in/for-companies" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://workvia.upcurv.in/for-companies" }],
  }),
  component: ForCompanies,
});

function ForCompanies() {
  const benefits = [
    { icon: Zap, title: "Match in 48 hours", desc: "Post a requirement and get a curated shortlist in two days." },
    { icon: ShieldCheck, title: "Top 2% vetted", desc: "Every talent passes skill tests and reference checks." },
    { icon: Clock, title: "Flexible engagements", desc: "Hourly, daily, part-time, full-time. Scale up or down anytime." },
    { icon: LineChart, title: "Project visibility", desc: "Timesheets, milestones, and progress dashboards in real time." },
    { icon: Users, title: "Replacement guarantee", desc: "Backup talent on standby if anyone drops out." },
    { icon: Wallet, title: "Single invoice", desc: "We handle contracts, payouts and compliance. You pay once." },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="For Companies"
        title={<>Build your team in days, <span className="italic text-accent">not months.</span></>}
        description="From a single specialist to a full pod — get pre-vetted talent matched by our AI, onboarded by our team."
      />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-border/60 bg-white p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-soft text-accent">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{b.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>

        <div id="inquiry" className="mt-16 scroll-mt-24" tabIndex={-1}>
          <HiringInquiryForm />
        </div>
      </section>
    </PageShell>
  );
}

type FormState = {
  name: string;
  workEmail: string;
  company: string;
  phone: string;
  roles: string;
  headcount: string;
  engagement: string;
  budget: string;
  startWhen: string;
  details: string;
};

function HiringInquiryForm() {
  const [f, setF] = useState<FormState>({
    name: "", workEmail: "", company: "", phone: "",
    roles: "", headcount: "1", engagement: "Contract",
    budget: "", startWhen: "Within 2 weeks", details: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = <K extends keyof FormState>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name || !f.workEmail || !f.company || !f.roles) {
      toast.error("Please fill in the required fields");
      return;
    }
    setLoading(true);
    // Simulate a submit; a real endpoint can be wired later.
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setDone(true);
    toast.success("Thanks — our team will reach out within one business day.");
  }

  if (done) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-border/60 bg-white p-10 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-display text-2xl tracking-tight">Request received</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          A Workvia hiring partner will email <span className="font-medium text-foreground">{f.workEmail}</span> within one business day with a shortlist plan.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-border/60 bg-white p-8 md:p-10" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">Hiring inquiry</p>
        <h3 className="mt-1 font-display text-2xl tracking-tight text-foreground">Tell us who you need</h3>
        <p className="mt-1 text-sm text-muted-foreground">Share your requirement and we'll come back with a shortlist within 48 hours.</p>
      </div>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <Field label="Your name *" id="name" value={f.name} onChange={set("name")} required />
        <Field label="Work email *" id="workEmail" type="email" value={f.workEmail} onChange={set("workEmail")} required />
        <Field label="Company *" id="company" value={f.company} onChange={set("company")} required />
        <Field label="Phone" id="phone" value={f.phone} onChange={set("phone")} />
        <Field label="Roles you're hiring for *" id="roles" placeholder="e.g. Senior React engineer, DevOps" value={f.roles} onChange={set("roles")} required className="md:col-span-2" />
        <SelectField label="Headcount" id="headcount" value={f.headcount} onChange={set("headcount")}
          options={["1", "2–5", "6–10", "10+"]} />
        <SelectField label="Engagement" id="engagement" value={f.engagement} onChange={set("engagement")}
          options={["Contract", "Contract-to-hire", "Full-time", "Project-based"]} />
        <SelectField label="Budget (₹ / hour or month)" id="budget" value={f.budget} onChange={set("budget")}
          options={["Not sure yet", "₹500–1,000 / hr", "₹1,000–2,500 / hr", "₹2,500+ / hr", "Monthly retainer"]} />
        <SelectField label="Start timeline" id="startWhen" value={f.startWhen} onChange={set("startWhen")}
          options={["Immediately", "Within 2 weeks", "Within a month", "Exploring"]} />
        <div className="md:col-span-2">
          <label htmlFor="details" className="text-sm font-medium text-foreground">Project details</label>
          <textarea id="details" rows={4} value={f.details} onChange={set("details")}
            placeholder="Tech stack, scope, timezone, must-have skills…"
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
        </div>
        <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-muted-foreground">We reply within one business day. No spam.</p>
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Sending…" : <>Send hiring request <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, id, type = "text", value, onChange, required, placeholder, className,
}: {
  label: string; id: string; type?: string; value: string; placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
      <input id={id} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
    </div>
  );
}

function SelectField({
  label, id, value, onChange, options,
}: {
  label: string; id: string; value: string; options: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
      <select id={id} value={value} onChange={onChange}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
