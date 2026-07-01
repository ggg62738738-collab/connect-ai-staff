import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/page-shell";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Workvia" },
      { name: "description", content: "Simple, transparent pricing. Pay only for the talent you use." },
      { property: "og:title", content: "Pricing — Workvia" },
      { property: "og:description", content: "Simple, transparent pricing. Pay only for the talent you use." },
    ],
  }),
  component: Pricing,
});

const tiers = [
  {
    name: "Starter",
    price: "0",
    tag: "Free to post",
    desc: "For small teams hiring their first specialist.",
    features: ["Post unlimited requirements", "AI-matched shortlist", "Basic onboarding", "Email support"],
  },
  {
    name: "Growth",
    price: "10%",
    tag: "Most popular",
    highlighted: true,
    desc: "For scaling teams running multiple projects at once.",
    features: ["Everything in Starter", "Dedicated talent manager", "Replacement guarantee", "Timesheets + invoicing", "Priority matching"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    tag: "Talk to sales",
    desc: "For organizations with compliance, MSA and volume needs.",
    features: ["Custom MSA & SLAs", "SSO + audit logs", "Dedicated CSM", "Custom integrations"],
  },
];

function Pricing() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Pricing"
        title="Simple, transparent pricing."
        description="Posting is free. Pay a margin only when you hire — no setup fees, no surprises."
      />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`flex flex-col rounded-3xl border p-8 ${t.highlighted ? "border-accent bg-foreground text-background" : "border-border/60 bg-white"}`}
              style={!t.highlighted ? { boxShadow: "var(--shadow-card)" } : undefined}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${t.highlighted ? "bg-accent text-accent-foreground" : "bg-violet-soft text-accent"}`}>
                  {t.tag}
                </span>
              </div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl tracking-tight">{t.price}</span>
                {t.price !== "Custom" ? <span className={t.highlighted ? "text-background/70" : "text-muted-foreground"}>margin</span> : null}
              </div>
              <p className={`mt-2 text-sm ${t.highlighted ? "text-background/70" : "text-muted-foreground"}`}>{t.desc}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={`mt-0.5 h-4 w-4 ${t.highlighted ? "text-accent" : "text-accent"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={t.name === "Enterprise" ? "/contact" : "/register"}
                className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium ${t.highlighted ? "bg-accent text-accent-foreground" : "bg-foreground text-background"}`}
              >
                {t.name === "Enterprise" ? "Contact sales" : "Get started"}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}