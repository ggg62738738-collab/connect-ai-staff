import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/site/page-shell";
import { Loader2, Check, X, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMe } from "@/lib/auth.functions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your talent account — Workvia" },
      { name: "description", content: "Join Workvia as a talent — student, freelancer, or professional." },
    ],
  }),
  component: Register,
});

type Rule = { label: string; test: (s: string) => boolean };
const RULES: Rule[] = [
  { label: "At least 8 characters", test: (s) => s.length >= 8 },
  { label: "One uppercase letter", test: (s) => /[A-Z]/.test(s) },
  { label: "One lowercase letter", test: (s) => /[a-z]/.test(s) },
  { label: "One number", test: (s) => /\d/.test(s) },
  { label: "One symbol", test: (s) => /[^A-Za-z0-9]/.test(s) },
];

function Register() {
  const role = "freelancer" as const;
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const passed = useMemo(() => RULES.map((r) => r.test(form.password)), [form.password]);
  const score = passed.filter(Boolean).length;
  const strength = score <= 1 ? "Weak" : score <= 3 ? "Fair" : score === 4 ? "Good" : "Strong";
  const strengthTone =
    score <= 1 ? "bg-rose-500" : score <= 3 ? "bg-amber-500" : score === 4 ? "bg-sky-500" : "bg-emerald-500";
  const strengthText =
    score <= 1 ? "text-rose-600" : score <= 3 ? "text-amber-600" : score === 4 ? "text-sky-600" : "text-emerald-600";
  const allPassed = score === RULES.length;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!allPassed) {
      toast.error("Please meet all password requirements");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { full_name: form.name, role },
      },
    });
    if (error) { setLoading(false); toast.error(error.message); return; }
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: form.email, password: form.password,
    });
    if (signInErr) {
      setLoading(false);
      toast.success("Account created. Please confirm your email and log in.");
      navigate({ to: "/login" });
      return;
    }
    try {
      const me = await getMe();
      queryClient.setQueryData(["session", "me"], me);
      await router.invalidate();
      toast.success("Welcome — let's set up your profile");
      navigate({ to: "/freelancer/onboarding" });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not load profile");
    } finally { setLoading(false); }
  }

  return (
    <PageShell>
      <section className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-border/60 bg-white p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <h1 className="font-display text-3xl tracking-tight text-foreground">Join as a talent</h1>
          <p className="mt-1 text-sm text-muted-foreground">Get started in under a minute. Company hiring is invite-only for now.</p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <Input label="Full name" id="name" value={form.name} onChange={update("name")} required />
            <Input label="Work email" id="email" type="email" value={form.email} onChange={update("email")} required />

            <div>
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  onBlur={() => setTouched(true)}
                  required
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 pr-10 text-sm outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {form.password.length > 0 ? (
                <>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full transition-all ${strengthTone}`} style={{ width: `${(score / RULES.length) * 100}%` }} />
                    </div>
                    <span className={`text-xs font-medium ${strengthText}`}>{strength}</span>
                  </div>
                  <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                    {RULES.map((r, i) => (
                      <li key={r.label} className="flex items-center gap-1.5 text-[11px]">
                        {passed[i] ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <X className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={passed[i] ? "text-emerald-700" : "text-muted-foreground"}>{r.label}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-1.5 text-[11px] text-muted-foreground">Use 8+ chars with upper, lower, number, and symbol.</p>
              )}
              {touched && !allPassed && form.password.length > 0 ? (
                <p className="mt-1.5 text-xs text-rose-600">Password doesn't meet all requirements yet.</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loading || !allPassed || !form.name || !form.email}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Creating…" : "Create talent account"}
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              By continuing, you agree to Workvia's Terms of Service and Privacy Policy.
            </p>
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
