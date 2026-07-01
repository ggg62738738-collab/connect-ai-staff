import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/page-shell";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Workvia" },
      { name: "description", content: "Get in touch with our team. We respond within one business day." },
      { property: "og:title", content: "Contact — Workvia" },
      { property: "og:description", content: "Get in touch with our team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Contact"
        title="Let's talk."
        description="Tell us about your hiring needs or your freelance practice. We'll get back within one business day."
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-5">
        <form className="md:col-span-3 rounded-3xl border border-border/60 bg-white p-8" style={{ boxShadow: "var(--shadow-card)" }} onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" id="name" />
            <Field label="Work email" id="email" type="email" />
            <Field label="Company" id="company" />
            <Field label="Phone" id="phone" />
          </div>
          <div className="mt-4">
            <label htmlFor="message" className="text-sm font-medium text-foreground">How can we help?</label>
            <textarea id="message" rows={5} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
          </div>
          <button type="submit" className="mt-6 inline-flex items-center rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background">
            Send message
          </button>
        </form>
        <div className="md:col-span-2 space-y-4">
          <InfoCard icon={Mail} title="Email" value="hello@workvia.com" />
          <InfoCard icon={Phone} title="Phone" value="+91 80 4567 8901" />
          <InfoCard icon={MapPin} title="Office" value="Bengaluru · Remote-first" />
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, id, type = "text" }: { label: string; id: string; type?: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
      <input id={id} type={type} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }: { icon: React.ComponentType<{ className?: string }>; title: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-white p-5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-soft text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}