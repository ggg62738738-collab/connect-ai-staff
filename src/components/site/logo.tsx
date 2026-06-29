import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="Talentora home">
      <span className="relative inline-flex h-8 w-8 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-violet/90" />
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-peach mix-blend-multiply" />
        <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-cream" />
      </span>
      <span className="text-xl font-semibold tracking-tight text-foreground">talentora</span>
    </Link>
  );
}