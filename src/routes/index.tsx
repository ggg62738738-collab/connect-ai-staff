import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import heroImage from "@/assets/hero-talent.jpg";
import {
  ArrowRight,
  Sparkles,
  Wallet,
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Rocket,
  ShieldCheck,
  Star,
  Clock,
} from "lucide-react";

const SITE_URL = "https://workvia.upcurv.in";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workvia — Freelance jobs, internships & remote work for students and professionals in India" },
      {
        name: "description",
        content:
          "Workvia is India's freelance & remote-work network for students, freshers, and professionals. Get vetted, land quality projects, ship great work, and get paid on time.",
      },
      {
        name: "keywords",
        content:
          "workvia, freelance jobs India, remote jobs for students, freelance for freshers, part-time work India, upcurv, Coimbatore freelance, remote work platform, student internships, vetted freelancers, gig work India, upwork alternative India",
      },
      { property: "og:title", content: "Workvia — Freelance & remote work for students and professionals" },
      {
        property: "og:description",
        content:
          "Join India's talent-first freelance network. Vetted profiles, real projects, on-time payouts.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:site_name", content: "Workvia" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Workvia — Freelance & remote work for talent" },
      {
        name: "twitter:description",
        content: "India's freelance network for students, freshers and professionals.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Workvia",
          url: SITE_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/for-freelancers?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PageShell>
      <Hero />
      <TalentValueProps />
      <HowItWorks />
      <PopularRoles />
      <Testimonial />
      <ForCompaniesTeaser />
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
            <Sparkles className="h-3.5 w-3.5" /> For students, freshers & professionals
          </span>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
            Get hired by growing companies through Workvia
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
            Workvia connects skilled professionals, freelancers, students, and fresh graduates with verified companies hiring contract, internship, and project-based talent.
            Create your profile, get verified, and let our team match you with the right opportunities.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
            >
              Join Talent Network
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/for-freelancers"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary"
            >
              How Workvia Works
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5 text-accent" /> Verified talent network</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-accent" /> Company-matched opportunities</span>
            <span className="inline-flex items-center gap-1"><Wallet className="h-3.5 w-3.5 text-accent" /> On-time payouts</span>
          </div>
        </div>
        <div className="relative">
          <img
            src={heroImage}
            alt="Indian freelancers and students working on remote projects"
            width={1280}
            height={960}
            className="relative z-10 w-full"
          />
          <FloatingCard className="left-4 top-6 hidden md:flex">
            <div className="flex -space-x-2">
              {["A", "S", "R"].map((l) => (
                <span key={l} className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-violet/80 text-[10px] font-semibold text-white">{l}</span>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Verified Talent Network</p>
              <p className="text-[10px] text-muted-foreground">Students • Professionals • Freelancers</p>
            </div>
          </FloatingCard>
          <FloatingCard className="bottom-10 left-2 hidden md:flex">
            <Wallet className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs font-semibold text-foreground">Verified Company</p>
              <p className="text-[10px] text-muted-foreground">Opportunities</p>
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

function TalentValueProps() {
  const perks = [
    { icon: Briefcase, title: "Verified Company Opportunities", desc: "Opportunities from trusted startups, enterprises, and growing businesses." },
    { icon: GraduationCap, title: "For Students & Professionals", desc: "Whether you're starting your career or bringing years of experience, Workvia helps you get discovered." },
    { icon: Wallet, title: "Managed Hiring Process", desc: "We coordinate screening, communication, onboarding, and deployment." },
    { icon: BadgeCheck, title: "Professional Talent Profile", desc: "Showcase your skills, certifications, projects, and experience in one verified profile." },
    { icon: Clock, title: "Flexible Opportunities", desc: "Contract, internship, project-based, remote, hybrid, or onsite opportunities." },
    { icon: Rocket, title: "Career Growth", desc: "Gain industry experience, strengthen your profile, and unlock future opportunities." },
  ];
  return (
    <section style={{ background: "var(--section-cream)" }}>
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Why talents pick Workvia</span>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
            Everything You Need To Get Hired
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {perks.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border/60 bg-white p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-soft text-accent">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Create your talent profile", desc: "Create your professional profile with your resume, skills, experience, certifications, and availability." },
    { title: "Get Verified & Shortlisted", desc: "Our recruiters review your profile and match you with suitable company requirements." },
    { title: "Start Your Contract", desc: "Once selected, begin working with the company while Workvia manages the hiring journey." },
  ];
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">How Workvia works</span>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
            How Workvia Connects You With Companies
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-3xl border border-border/60 bg-white p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet text-sm font-semibold text-white">{i + 1}</span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{s.title}</h3>
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
    { title: "Full Stack Developer", rate: "₹500–1,500/hr" },
    { title: "UI/UX Designer", rate: "₹400–1,200/hr" },
    { title: "Mobile Developer", rate: "₹500–1,400/hr" },
    { title: "Content Writer", rate: "₹200–800/hr" },
    { title: "Video Editor", rate: "₹300–900/hr" },
    { title: "Data Analyst", rate: "₹400–1,200/hr" },
  ];
  return (
    <section style={{ background: "var(--section-lavender)" }}>
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Popular categories</span>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
            Talent Categories Companies Hire Most
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
                <p className="text-xs text-muted-foreground">Typical rate {r.rate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="mx-auto flex justify-center gap-1 text-amber-400">
          {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}
        </div>
        <p className="mx-auto mt-4 max-w-2xl font-display text-2xl leading-snug text-foreground md:text-3xl">
          "I landed my first paid project in my second semester. Workvia handled the client trust and payments — I just shipped."
        </p>
        <p className="mt-4 text-sm text-muted-foreground">— Rajesh R, Frontend Developer</p>
      </div>
    </section>
  );
}

function ForCompaniesTeaser() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-6 pb-6">
        <div className="rounded-3xl border border-border/60 bg-secondary/50 p-8 md:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">Hiring on Workvia</span>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-foreground md:text-4xl">
                Companies: hire vetted Indian talent, fast.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Post a role, get a curated shortlist in 48 hours, and manage contracts, timesheets and payouts in one place.
              </p>
            </div>
            <Link to="/for-companies" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background">
              For companies <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
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
            Your first freelance gig is one profile away.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-background/70 md:text-base">
            Join hundreds of Indian students, freshers and professionals earning through Workvia.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-95">
              Create free talent account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/for-freelancers" className="inline-flex items-center rounded-full border border-background/30 px-5 py-3 text-sm font-medium text-background hover:bg-background/10">
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
