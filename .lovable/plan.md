## Audit result (DB ↔ code)

Good news: after the last migration, every table the code references now exists (`profiles`, `freelancer_profiles`, `freelancer_onboarding`, `applications`, `application_notes`, `jobs`, `companies`, `company_members`, `contracts`, `timesheets`, `payments`, `user_roles`). No more "type never" TS errors from missing tables.

Real gaps I want to close before launch:

1. **Rich onboarding data has nowhere structured to live.** Everything in the 10-step form is stuffed into `freelancer_onboarding.data` (JSONB). Fine for MVP, but admin filtering ("show me React devs, 3+ yrs, available in 15 days") can't be indexed. We should promote the highest-signal fields to real columns on `freelancer_profiles`: `photo_url, mobile, mobile_verified, email_verified, city, country, primary_role, total_experience, employment_status, notice_period, expected_daily_rate, expected_hourly_rate, resume_url, linkedin_url, github_url, portfolio_url, available_from, register_as`. Keep the full JSON for everything else.
2. **No storage buckets.** Avatar, resume, cover letter, ID/passport, offer letter, experience letter uploads all fail today. Need three buckets: `avatars` (public), `resumes` (private, owner + staff read), `verification-docs` (private, owner + staff read).
3. **`profiles` is missing `avatar_url` and `phone`** used by the header profile chip and admin talent detail.
4. **Applications table** has no `updated_at` trigger (only column). Minor — add trigger.
5. **`applications.match`** is `NOT NULL DEFAULT` unspecified — confirm default 0.
6. **No `notifications` table** for "we'll notify you when work is available" — needed for the empty-state promise on Find Work.
7. **Public read policy on `jobs`** — Find Work must be visible to signed-in freelancers; verify RLS allows it.

## Launch focus: freelancer-first

Everything else (company portal, contracts, timesheets, payments) is deferred. Freelancer signup → complete profile → be visible to admin/recruiter is the whole v1 loop.

### Phase 1 — Schema + storage (one migration)
- Add columns above to `freelancer_profiles` and `profiles`.
- Create `notifications` table (`user_id, kind, title, body, read_at`).
- Create the 3 storage buckets with RLS: owner writes to their `{user_id}/…` prefix; staff (`is_staff`) reads all; `avatars` public read.
- Add `updated_at` trigger on `applications`.
- Ensure `has_role`/`is_staff` used everywhere (already in place).

### Phase 2 — Freelancer portal polish
- **Onboarding page**: wire file uploads to storage buckets, mirror promoted fields back into `freelancer_profiles` on save (server-fn does both writes atomically), show real % complete + talent score.
- **Profile page**: add avatar upload; header profile chip reads `profiles.avatar_url`.
- **Register → onboarding**: after signup, hard-redirect to `/freelancer/onboarding` (already done, verify).
- **Find Work empty state**: hand-drawn illustration + "We'll notify you when matching work appears" — inserts a `notifications` opt-in row.
- **Earnings page**: keep read-only for now (no contracts yet); show empty state with copy "Earnings appear here once your first contract starts."

### Phase 3 — Admin visibility into talent (minimum)
- Admin Talent list filters by promoted columns (role, experience, availability, city).
- Admin Talent detail: full onboarding JSON rendered by section + recruiter notes/assessment save (already wired).
- Notify admin on new freelancer signup (row into `notifications` for all admins).

### Deferred (post-launch)
Company portal, job posting flow, applications pipeline, contracts, timesheets, payments UI. The tables stay so nothing breaks, but no product work on them now.

## Technical notes
- One migration for Phase 1; new columns are nullable so existing rows are fine.
- Storage RLS uses `bucket_id + auth.uid()::text = (storage.foldername(name))[1]` for owner writes; staff read via `public.is_staff(auth.uid())`.
- Onboarding save server-fn does `upsert freelancer_onboarding` and `update freelancer_profiles` in the same handler (RLS as user handles both).
- `notifications` gets realtime enabled so the header bell updates live.

## What I need from you
Confirm and I'll implement Phase 1 (migration + buckets) and Phase 2 (freelancer portal wiring) in the next turn. Say the word if you want any Phase 3 item pulled forward or Phase 2 item deferred.