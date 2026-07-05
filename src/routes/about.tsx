import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/page-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Workvia — India's freelance & talent network" },
      { name: "description", content: "Workvia is an Upcurv product building India's freelance operating system for students, freshers and professionals. Learn our story and mission." },
      { property: "og:title", content: "About Workvia — India's freelance & talent network" },
      { property: "og:description", content: "Building India's freelance operating system for students and professionals." },
      { property: "og:url", content: "https://workvia.upcurv.in/about" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://workvia.upcurv.in/about" }],
  }),
  component: About,
});

function About() {
  const stats = [
    { v: "100+", l: "Vetted professionals" },
    { v: "5+", l: "Companies served" },
    { v: "48h", l: "Average match time" },
    { v: "98%", l: "Project success rate" },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="About us"
        title={<>We're building the talent <span className="italic text-accent">operating system.</span></>}
        description="Workvia started as a small staffing studio. Today we power hiring and project delivery for hundreds of teams across the world."
      />
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="rounded-2xl border border-border/60 bg-white p-6 text-center">
              <div className="font-display text-4xl text-foreground">{s.v}</div>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>
            We believe great work happens when great people meet great teams — without the friction of agencies, paperwork or chasing invoices.
          </p>
          <p>
            Our platform combines AI-powered matching with a human ops team so companies can scale fast and talent can focus on what they love: shipping.
          </p>
          <p>
            We're a remote-first company with operators across India, Europe and the US, building tools we wish existed when we were doing this work the hard way.
          </p>
        </div>
      </section>
    </PageShell>
  );
}