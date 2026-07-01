import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/workvia-logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="Workvia home">
      <img src={logoUrl} alt="Workvia" className="h-8 w-8 object-contain" />
      <span className="text-xl font-semibold tracking-tight text-foreground">workvia</span>
    </Link>
  );
}
