import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Talentora" },
      { name: "description", content: "Log in to your Talentora account." },
    ],
  }),
  component: Login,
});

function Login() {
  return (
    <PageShell>
      <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-border/60 bg-white p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <h1 className="font-display text-3xl tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Log in to your Talentora account.</p>
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <input id="email" type="email" className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <input id="password" type="password" className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
            </div>
            <button type="submit" className="w-full rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background">
              Log in
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/register" className="font-medium text-accent">Create one</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}