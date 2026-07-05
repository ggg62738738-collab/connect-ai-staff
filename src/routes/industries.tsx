import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/page-shell";
import { Code2, Cpu, ShoppingBag, Banknote, HeartPulse, Rocket, Building2, Tv } from "lucide-react";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries we serve — SaaS, Fintech, AI, Healthcare & more | Workvia" },
      { name: "description", content: "Workvia freelancers ship for SaaS, fintech, AI, healthcare, e-commerce and enterprise teams across India and beyond." },
      { property: "og:title", content: "Industries served by Workvia freelancers" },
      { property: "og:description", content: "Freelance and remote talent for SaaS, fintech, AI, healthcare and more." },
      { property: "og:url", content: "https://workvia.upcurv.in/industries" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://workvia.upcurv.in/industries" }],
  }),
  component: Industries,
});

function Industries() {
  const items = [
    { icon: Code2, title: "SaaS & Software", desc: "Engineers, designers, PMs for product teams of every stage." },
    { icon: Banknote, title: "Fintech", desc: "Specialists who understand compliance, ledgers and payments." },
    { icon: HeartPulse, title: "Healthcare", desc: "HIPAA-aware engineers and analysts for sensitive workloads." },
    { icon: ShoppingBag, title: "E-commerce & Retail", desc: "Storefront, ops and growth talent for D2C and marketplaces." },
    { icon: Rocket, title: "Startups", desc: "Fractional CTOs, founding engineers, growth hackers." },
    { icon: Building2, title: "Enterprise", desc: "Vetted specialists augmenting your internal teams at scale." },
    { icon: Cpu, title: "AI & Data", desc: "ML engineers, data scientists, MLOps and analytics talent." },
    { icon: Tv, title: "Media & Creative", desc: "Designers, editors, producers and creative technologists." },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="Industries"
        title="Built for every kind of team."
        description="Whatever you're building, we have the specialists who've shipped in your industry before."
      />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map((i) => (
            <div key={i.title} className="rounded-2xl border border-border/60 bg-white p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-soft text-accent">
                <i.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{i.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{i.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}