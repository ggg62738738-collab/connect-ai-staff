import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "./logo";
import { useSessionUser, signOutAndClear } from "@/lib/use-session";
import { useQueryClient } from "@tanstack/react-query";

const nav = [
  { to: "/for-companies", label: "For Companies" },
  { to: "/for-freelancers", label: "For Talents" },
  { to: "/industries", label: "Industries" },
  { to: "/how-it-works", label: "How it Works" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const { signedIn, user } = useSessionUser();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const portal = user?.roles.includes("admin") || user?.roles.includes("recruiter")
    ? "/admin"
    : user?.roles.includes("freelancer")
      ? "/freelancer"
      : "/";
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <Link to={portal} className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary sm:inline-flex">
                Open portal
              </Link>
              <button
                onClick={async () => { await signOutAndClear(qc); navigate({ to: "/" }); }}
                className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary sm:inline-flex">
                Log in
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.02]">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}