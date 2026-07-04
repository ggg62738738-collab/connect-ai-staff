import type { ReactNode } from "react";

type Variant = "applications" | "contracts" | "timesheets" | "earnings" | "generic";

export function EmptyState({
  variant = "generic",
  title,
  description,
  action,
  className = "",
}: {
  variant?: Variant;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed bg-cream/40 px-6 py-14 text-center ${className}`}>
      <Illustration variant={variant} />
      <h3 className="mt-5 font-display text-lg">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function Illustration({ variant }: { variant: Variant }) {
  const common = "h-28 w-40";
  switch (variant) {
    case "applications":
      return (
        <svg viewBox="0 0 200 140" className={common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="42" y="30" width="90" height="80" rx="6" className="fill-cream text-violet/60" />
          <rect x="52" y="20" width="90" height="80" rx="6" className="fill-white text-violet" />
          <path d="M64 42 h64 M64 56 h50 M64 70 h58 M64 84 h40" className="text-violet/40" />
          <circle cx="150" cy="96" r="16" className="fill-violet text-violet" />
          <path d="M143 96 l5 5 l10 -10" className="text-white" strokeWidth="2.5" />
          <path d="M30 30 q6 -6 12 0" className="text-violet/40" />
          <path d="M170 40 q6 -6 12 0" className="text-violet/40" />
        </svg>
      );
    case "contracts":
      return (
        <svg viewBox="0 0 200 140" className={common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M60 20 h60 l20 20 v80 a4 4 0 0 1 -4 4 h-76 a4 4 0 0 1 -4 -4 v-96 a4 4 0 0 1 4 -4 z" className="fill-white text-violet" />
          <path d="M120 20 v20 h20" className="text-violet" />
          <path d="M72 60 h56 M72 74 h56 M72 88 h40" className="text-violet/40" />
          <path d="M78 108 q10 -8 22 -2 t22 -2" className="text-violet" strokeWidth="2.2" />
          <circle cx="150" cy="34" r="10" className="fill-cream text-violet/70" />
          <path d="M145 34 l4 4 l7 -7" className="text-violet" strokeWidth="2.2" />
        </svg>
      );
    case "timesheets":
      return (
        <svg viewBox="0 0 200 140" className={common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="100" cy="72" r="46" className="fill-white text-violet" />
          <circle cx="100" cy="72" r="46" className="text-violet" />
          <path d="M100 72 l0 -24 M100 72 l18 10" className="text-violet" strokeWidth="2.4" />
          <circle cx="100" cy="72" r="3" className="fill-violet text-violet" />
          <path d="M60 30 l8 -8 M140 30 l-8 -8" className="text-violet" />
          <path d="M40 90 q6 -6 12 0" className="text-violet/40" />
          <path d="M158 92 q6 -6 12 0" className="text-violet/40" />
        </svg>
      );
    case "earnings":
      return (
        <svg viewBox="0 0 200 140" className={common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="40" y="52" width="120" height="64" rx="8" className="fill-white text-violet" />
          <rect x="40" y="52" width="120" height="16" className="fill-violet text-violet" />
          <circle cx="100" cy="90" r="14" className="fill-cream text-violet" />
          <path d="M96 86 h8 M96 90 h8 M100 82 v16" className="text-violet" strokeWidth="2.2" />
          <path d="M55 46 l16 -16 h58 l16 16" className="text-violet/60" />
          <path d="M30 110 q6 -6 12 0" className="text-violet/40" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 200 140" className={common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="100" cy="72" r="46" className="fill-cream text-violet/60" />
          <path d="M78 72 h44 M100 50 v44" className="text-violet" strokeWidth="2.4" />
        </svg>
      );
  }
}
