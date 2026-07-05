This is a large multi-part request. Here's how I'll tackle it, grouped by area. I'll ship in this order so each piece is verifiable.

## 1. Quick content + UI fixes (single pass)
- **About page** — change "12k" → "100+", "600+" → "5+".
- **Contact page** — email `upcurvinnovations@gmail.com`, phone `6380715292`, office `Coimbatore, Tamil Nadu`.
- **Login + Register** — add eye-toggle on password fields (reuse a small `PasswordInput` component).
- **Admin talent detail** — route `/admin/freelancers/$id` exists but detail page doesn't render. Debug and fix the loader/component so clicking a row opens the profile instead of only changing the URL.

## 2. Homepage repositioning (freelancers/students/professionals first)
- Rewrite hero, value props, sections, and CTAs on `src/routes/index.tsx` to speak to **freelancers, students, and professionals** first (find work, build portfolio, get paid, upskill), with companies as a secondary audience below.
- Keep existing components/layout; only copy + a couple of section reorders.

## 3. SEO for `workvia.upcurv.in`
- Update root `head()` title/description/OG defaults and per-route metadata across public pages (`index`, `about`, `for-freelancers`, `for-companies`, `how-it-works`, `pricing`, `industries`, `contact`) targeting keywords: *workvia, freelance jobs India, hire vetted freelancers, student freelance platform, remote work India, Coimbatore freelance*.
- Set canonical + `og:url` to `https://workvia.upcurv.in/...`.
- Add JSON-LD `Organization` + `WebSite` (with SearchAction) on root, `BreadcrumbList` on inner pages, `FAQPage` where FAQs exist.
- Update `public/robots.txt` sitemap URL and `src/routes/sitemap[.]xml.ts` BASE_URL to `https://workvia.upcurv.in`.
- Add semantic H1s, alt text audit.

## 4. OTP email verification on register
- **DB**: new table `email_otps` (user_id, code_hash, purpose, expires_at, consumed_at, attempts). Migration includes GRANTs + RLS.
- **Server fns** (`src/lib/otp.functions.ts`): `sendSignupOtp({ email })`, `verifyOtp({ email, code })`. Verify marks user's email confirmed via `supabaseAdmin.auth.admin.updateUserById`, issues session? — actually we can't create a client session server-side without a magic link. Simpler: after OTP verify, call `admin.updateUserById({ email_confirm: true })` and return success; the frontend then calls `supabase.auth.signInWithPassword` using the password captured at register time (kept in component state) to auto-login. Also fires welcome email.
- **Email sending**: uses `email_settings` SMTP row via `nodemailer`. Branded HTML template (OTP + welcome).
- **Frontend**: `/register` → after `signUp`, redirect to `/verify-email?email=...` with 6-digit OTP UI, resend button (60s cooldown). On success → auto sign-in → `/freelancer`.
- Supabase `Confirm email` should be OFF for this to work smoothly — I'll note it in chat with a dashboard link.

## 5. Advanced Post Job form (admin)
Extend `admin.jobs` create/edit form with: job type (full-time/part-time/contract/internship), work mode (remote/hybrid/onsite), experience level, min/max budget + currency, duration, start date, application deadline, required skills (multi-tag), preferred skills, responsibilities (rich text/markdown), requirements, perks, visibility (public/private/invite-only), number of openings, screening questions (repeater).
- Migration: add columns to `jobs` table (nullable, safe defaults).

## 6. Contracts + Timesheets (functional)
- **Contracts**: table `contracts` (job_id, freelancer_id, company_id, rate, currency, start_date, end_date, status: draft/active/paused/ended, terms text, signed_at_freelancer, signed_at_company). Server fns: list/create/sign/end. Admin page + freelancer page render live data with actions (freelancer can sign/decline; admin can create/end).
- **Timesheets**: table `timesheet_entries` (contract_id, freelancer_id, work_date, hours, description, status: draft/submitted/approved/rejected, submitted_at, reviewed_at, reviewer_id). Weekly grouping in UI. Freelancer: add entries, submit week. Admin/company reviewer: approve/reject with note.
- Both get realtime-friendly queries via TanStack Query (no realtime channel yet).

## Technical notes
- Nodemailer runs in Cloudflare Worker — I'll verify at build; if it fails, fall back to a fetch-based Gmail SMTP-over-HTTPS via a lightweight lib, or move send into a Supabase Edge Function (existing SMTP path there is safer). Given prior plan already committed to nodemailer server-fn, I'll try that first.
- All new tables get GRANTs + RLS + updated_at trigger per project standard.
- Admin talent detail bug likely a missing route file or wrong param name — will read `admin.freelancers.$id.tsx` and the query.

## Scope check
This is 4–5 turns of work. I'll ship in this order: (1) content/UI fixes + admin detail bug, (2) SEO pass, (3) OTP flow + migration, (4) advanced job fields, (5) contracts + timesheets. After you approve the plan I'll start with group 1 and the migrations needed for groups 3/5/6 (batched so you approve DB changes once).
