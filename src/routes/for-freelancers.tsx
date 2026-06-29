import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/page-shell";
import { ArrowRight, Briefcase, Clock, BadgeCheck, Wallet, Star, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/for-freelancers")({
  head: () => ({
    meta: [
      { title: "For Freelancers — Talentora" },
      { name: "description", content: "Get matched with great companies, ship work you love, and get paid on time. Join the Talentora network." },
      { property: "og:title", content: "For Freelancers — Talentora" },
      { property: "og:description", content: "Find great clients, ship great work, get paid on time." },
    ],
  }),
  component: ForFreelancers,
});

function ForFreelancers() {
  const perks = [
    { icon: Briefcase, title: "Quality projects", desc: "Work with vetted companies on briefs that match your skills." },
    { icon: Wallet, title: "On-time payouts", desc: "Daily-rate based invoicing with predictable, on-time payments." },
    { icon: Clock, title: "Flexible schedule", desc: "Pick remote, hybrid or onsite. Choose your hours and your stack." },
    { icon: BadgeCheck, title: "Verified profile", desc: "Stand out with a verified badge once you pass our screening." },
    { icon: Star, title: "Ratings that count", desc: "Build a portable reputation with end-of-project ratings." },
    { icon: GraduationCap, title: "Skill growth", desc: "Free assessments, mock interviews, and curated learning paths." },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="For Freelancers"
        title={<>Do great work with <span className="italic text-accent">great teams.</span></>}
        description="Apply once, get matched to roles that fit your skills, location and rate. No more cold pitching."
      />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {perks.map((b) => (
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
            Join as freelancer <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}