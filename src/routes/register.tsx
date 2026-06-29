import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/page-shell";
import { Building2, UserRound } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Talentora" },
      { name: "description", content: "Join Talentora as a company or freelancer." },
    ],
  }),
  component: Register,
});

function Register() {
  const [role, setRole] = useState<"company" | "freelancer">("company");
  return (
    <PageShell>
      <section className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-border/60 bg-white p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <h1 className="font-display text-3xl tracking-tight text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Get started in under a minute.</p>
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-secondary p-1">
            <button onClick={() => setRole("company")} className={`flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${role === "company" ? "bg-white text-foreground shadow" : "text-muted-foreground"}`}>
              <Building2 className="h-4 w-4" /> I'm hiring
            </button>
            <button onClick={() => setRole("freelancer")} className={`flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${role === "freelancer" ? "bg-white text-foreground shadow" : "text-muted-foreground"}`}>
              <UserRound className="h-4 w-4" /> I'm a freelancer
            </button>
          </div>
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" id="name" />
              <Input label="Work email" id="email" type="email" />
            </div>
            {role === "company" ? (
              <Input label="Company" id="company" />
            ) : (
              <Input label="Primary skill" id="skill" placeholder="e.g. React, Figma, DevOps" />
            )}
            <Input label="Password" id="password" type="password" />
            <button type="submit" className="w-full rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background">
              {role === "company" ? "Create company account" : "Join as freelancer"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-accent">Log in</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}

function Input({ label, id, type = "text", placeholder }: { label: string; id: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} type={type} placeholder={placeholder} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
    </div>
  );
}