import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import heroImage from "@/assets/hero-talent.jpg";
import { ArrowRight, Sparkles, Users, BadgeCheck, Briefcase, LineChart, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Talentora — Connecting great companies with great freelancers" },
      { name: "description", content: "AI-powered talent network. On-demand, vetted professionals and managed projects — all in one place." },
      { property: "og:title", content: "Talentora — AI-powered talent network" },
      { property: "og:description", content: "Hire vetted freelancers on demand. Managed projects, transparent payments, all in one place." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PageShell>
      <Hero />
      <TrustedBy />
      <HowItWorks />
      <PopularRoles />
      <Differentiators />
      <CTASection />
    </PageShell>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 pt-16 pb-20 md:grid-cols-2 md:items-center md:pt-24 md:pb-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-white/70 px-3 py-1 text-xs font-medium text-accent">
            <Sparkles className="h-3.5 w-3.5" /> AI-Powered Talent Network
          </span>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
            Connecting great <br /> companies with{" "}
            <span className="italic text-accent">great freelancers.</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
            On-demand talent. Vetted professionals. Managed projects. All in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
            >
              Hire talent
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/for-freelancers"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Join as freelancer
            </Link>
          </div>
        </div>
        <div className="relative">
          <img
            src={heroImage}
            alt="Diverse 3D illustrated professionals collaborating"
            width={1280}
            height={960}
            className="relative z-10 w-full"
          />
          <FloatingCard className="left-4 top-6 hidden md:flex">
            <div className="flex -space-x-2">
              {["A", "B", "C"].map((l) => (
                <span key={l} className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-violet/80 text-[10px] font-semibold text-white">{l}</span>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Top 2% Talent</p>
              <p className="text-[10px] text-muted-foreground">Pre-vetted experts</p>
            </div>
          </FloatingCard>
          <FloatingCard className="bottom-10 left-2 hidden md:flex">
            <LineChart className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs font-semibold text-foreground">Project Delivered</p>
              <p className="text-[10px] text-muted-foreground">+38% this quarter</p>
            </div>
          </FloatingCard>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`absolute z-20 flex items-center gap-3 rounded-2xl border border-border/60 bg-white/95 px-3 py-2 backdrop-blur ${className}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {children}
    </div>
  );
}

function TrustedBy() {
  const logos = ["Linear", "Framer", "Vanta", "Notion", "Webflow", "Ramp"];
  return (
    <section className="border-y border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">
          Trusted by innovative companies worldwide
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {logos.map((l) => (
            <span key={l} className="text-xl font-semibold tracking-tight text-foreground/70">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Briefcase, title: "Post a requirement", desc: "Tell us what you need. We'll find the right match." },
    { icon: Users, title: "We match & onboard", desc: "We shortlist top talent and handle onboarding." },
    { icon: BadgeCheck, title: "You scale effortlessly", desc: "Manage projects, track work, and pay — all in one place." },
  ];
  return (
    <section style={{ background: "var(--section-cream)" }}>
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">How it works</span>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
            The smartest way to hire and work
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="rounded-3xl border border-border/60 bg-white p-6"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-soft text-accent">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{i + 1}. {s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PopularRoles() {
  const roles = [
    { title: "Full Stack Developer", rate: "₹3,000/day" },
    { title: "UI/UX Designer", rate: "₹2,500/day" },
    { title: "Mobile Developer", rate: "₹2,800/day" },
    { title: "DevOps Engineer", rate: "₹3,500/day" },
    { title: "Data Analyst", rate: "₹2,400/day" },
    { title: "QA Engineer", rate: "₹2,200/day" },
  ];
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Popular roles</span>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
            Top in-demand talent
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <div key={r.title} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-white p-4 transition-shadow hover:[box-shadow:var(--shadow-card)]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-accent">
                <Briefcase className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">From {r.rate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Differentiators() {
  const items = [
    { title: "AI resume parsing", desc: "Pull structured data from any CV in seconds." },
    { title: "AI skill matching", desc: "Rank candidates by fit, not by keywords." },
    { title: "AI interview summaries", desc: "Get crisp readouts after every call." },
    { title: "Automated reminders", desc: "Never lose a candidate to a missed follow-up." },
    { title: "Contract & invoice gen", desc: "Generated, signed, and stored automatically." },
    { title: "Replacement suggestions", desc: "Bench backups ready if anyone drops out." },
  ];
  return (
    <section style={{ background: "var(--section-lavender)" }}>
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Why teams pick us</span>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
            More than a staffing agency. A talent operating system.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.title} className="rounded-2xl border border-border/60 bg-white/80 p-5 backdrop-blur">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">{i.title}</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="overflow-hidden rounded-3xl bg-foreground px-8 py-14 text-center text-background md:px-16">
          <h2 className="font-display text-4xl tracking-tight md:text-5xl">
            Ready to build your dream team?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-background/70 md:text-base">
            Start hiring vetted talent in days — not months. Or join thousands of freelancers shipping great work.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-95">
              Hire talent <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/for-freelancers" className="inline-flex items-center rounded-full border border-background/30 px-5 py-3 text-sm font-medium text-background hover:bg-background/10">
              Join as freelancer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
