import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/page-shell";
import { ArrowRight, Zap, ShieldCheck, Clock, LineChart, Users, Wallet } from "lucide-react";

export const Route = createFileRoute("/for-companies")({
  head: () => ({
    meta: [
      { title: "For Companies — Workvia" },
      { name: "description", content: "Hire vetted freelancers on demand. Managed projects, transparent payments, AI-powered matching." },
      { property: "og:title", content: "For Companies — Workvia" },
      { property: "og:description", content: "Hire vetted freelancers on demand with AI-powered matching." },
    ],
  }),
  component: ForCompanies,
});

function ForCompanies() {
  const benefits = [
    { icon: Zap, title: "Match in 48 hours", desc: "Post a requirement and get a curated shortlist in two days." },
    { icon: ShieldCheck, title: "Top 2% vetted", desc: "Every freelancer passes skill tests and reference checks." },
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
        description="From a single specialist to a full pod — get pre-vetted freelancers matched by our AI, onboarded by our team."
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
        <div className="mt-12 flex justify-center">
          <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background">
            Post a requirement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}