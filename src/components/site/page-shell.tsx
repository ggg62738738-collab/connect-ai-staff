import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
}) {
  return (
    <section className="border-b border-border/60" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-5xl px-6 py-20 text-center md:py-28">
        {eyebrow ? (
          <span className="inline-flex items-center rounded-full border border-violet/30 bg-violet-soft/60 px-3 py-1 text-xs font-medium text-accent">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}