import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const KEY = "workvia.tour.freelancer.v1";

export function FreelancerTour() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only auto-launch on the overview page
    if (pathname !== "/freelancer") return;
    if (window.localStorage.getItem(KEY)) return;

    let cancelled = false;
    // Wait a tick for sidebar to mount
    const t = window.setTimeout(async () => {
      if (cancelled) return;
      const { driver } = await import("driver.js");
      await import("driver.js/dist/driver.css");
      const d = driver({
        showProgress: true,
        allowClose: true,
        overlayColor: "rgba(15, 15, 20, 0.55)",
        popoverClass: "workvia-tour",
        nextBtnText: "Next",
        prevBtnText: "Back",
        doneBtnText: "Got it",
        onDestroyed: () => {
          try { window.localStorage.setItem(KEY, new Date().toISOString()); } catch {}
        },
        steps: [
          {
            element: '[data-tour="sidebar-overview"]',
            popover: { title: "Welcome to Workvia 👋", description: "This is your talent portal. Let's take a 30-second tour." },
          },
          {
            element: '[data-tour="sidebar-onboarding"]',
            popover: { title: "Complete onboarding", description: "Add skills, docs and preferences so we can match roles to you." },
          },
          {
            element: '[data-tour="sidebar-jobs"]',
            popover: { title: "Find work", description: "Browse open roles ranked by how well they match your profile." },
          },
          {
            element: '[data-tour="sidebar-applications"]',
            popover: { title: "Track applications", description: "See where you stand in every pipeline you've entered." },
          },
          {
            element: '[data-tour="sidebar-contracts"]',
            popover: { title: "Contracts & timesheets", description: "Once hired, contracts and hours live here." },
          },
          {
            element: '[data-tour="sidebar-earnings"]',
            popover: { title: "Earnings", description: "Invoices and payouts land here as your work wraps up." },
          },
          {
            element: '[data-tour="topbar-avatar"]',
            popover: { title: "That's it!", description: "Head to onboarding whenever you're ready — we'll notify you about matched roles." },
          },
        ],
      });
      d.drive();
    }, 400);

    return () => { cancelled = true; window.clearTimeout(t); };
  }, [pathname]);

  return null;
}

export function resetFreelancerTour() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
