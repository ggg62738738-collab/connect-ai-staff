import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/page-shell";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it Works — Talentora" },
      { name: "description", content: "From requirement to invoice in one place. See how Talentora helps you hire and ship faster." },
      { property: "og:title", content: "How it Works — Talentora" },
      { property: "og:description", content: "From requirement to invoice in one place." },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  const steps = [
    { n: "01", title: "Tell us what you need", desc: "Share the role, skills, rate and timeline. Our AI parses the brief and matches your shortlist instantly." },
    { n: "02", title: "Meet your shortlist", desc: "Get 3–5 vetted candidates in 48 hours. Interview them in our platform with shareable summaries." },
    { n: "03", title: "Onboard in one click", desc: "We handle contracts, NDAs and onboarding. Your new hire shows up ready to ship." },
    { n: "04", title: "Track & approve work", desc: "Timesheets, milestones and async updates in one dashboard. Approve and pay in seconds." },
    { n: "05", title: "Scale or replace", desc: "Add more talent as you grow, or swap roles with our replacement guarantee." },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="How it works"
        title="A simpler way to hire and run projects."
        description="From the first brief to the final invoice, every step happens in one place."
      />
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="space-y-6">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-6 rounded-3xl border border-border/60 bg-white p-6 md:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="font-display text-4xl text-accent md:text-5xl">{s.n}</div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground md:text-base">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}