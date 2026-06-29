import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            AI-powered talent network. On-demand vetted professionals, managed projects, all in one place.
          </p>
        </div>
        <FooterCol title="Product" links={[
          { to: "/for-companies", label: "For Companies" },
          { to: "/for-freelancers", label: "For Freelancers" },
          { to: "/how-it-works", label: "How it Works" },
          { to: "/pricing", label: "Pricing" },
        ]} />
        <FooterCol title="Company" links={[
          { to: "/about", label: "About" },
          { to: "/industries", label: "Industries" },
          { to: "/contact", label: "Contact" },
        ]} />
        <FooterCol title="Account" links={[
          { to: "/login", label: "Log in" },
          { to: "/register", label: "Create account" },
        ]} />
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Talentora. All rights reserved.</p>
          <p>Made for modern teams.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="hover:text-foreground">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}