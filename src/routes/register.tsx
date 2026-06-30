import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/page-shell";
import { Building2, UserRound, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMe } from "@/lib/auth.functions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const [form, setForm] = useState({ name: "", email: "", password: "", extra: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { full_name: form.name, role },
      },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    // Auto sign-in (email confirmation off in dev).
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (signInErr) {
      setLoading(false);
      toast.success("Account created. Please check your email to confirm, then log in.");
      navigate({ to: "/login" });
      return;
    }
    try {
      const me = await getMe();
      queryClient.setQueryData(["session", "me"], me);
      await router.invalidate();
      toast.success("Welcome to Talentora");
      navigate({ to: role === "freelancer" ? "/freelancer" : "/" });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not load profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-border/60 bg-white p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <h1 className="font-display text-3xl tracking-tight text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Get started in under a minute.</p>
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-secondary p-1">
            <button type="button" onClick={() => setRole("company")} className={`flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${role === "company" ? "bg-white text-foreground shadow" : "text-muted-foreground"}`}>
              <Building2 className="h-4 w-4" /> I'm hiring
            </button>
            <button type="button" onClick={() => setRole("freelancer")} className={`flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${role === "freelancer" ? "bg-white text-foreground shadow" : "text-muted-foreground"}`}>
              <UserRound className="h-4 w-4" /> I'm a freelancer
            </button>
          </div>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" id="name" value={form.name} onChange={update("name")} required />
              <Input label="Work email" id="email" type="email" value={form.email} onChange={update("email")} required />
            </div>
            {role === "company" ? (
              <Input label="Company" id="company" value={form.extra} onChange={update("extra")} />
            ) : (
              <Input label="Primary skill" id="skill" placeholder="e.g. React, Figma, DevOps" value={form.extra} onChange={update("extra")} />
            )}
            <Input label="Password" id="password" type="password" value={form.password} onChange={update("password")} required minLength={6} />
            <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Creating…" : role === "company" ? "Create company account" : "Join as freelancer"}
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

function Input(props: { label: string; id: string; type?: string; placeholder?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; minLength?: number }) {
  const { label, id, type = "text", ...rest } = props;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} type={type} {...rest} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
    </div>
  );
}