
-- =========================================================================
-- ENUMS
-- =========================================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'recruiter', 'freelancer', 'company');
CREATE TYPE public.freelancer_status AS ENUM ('active', 'pending', 'suspended');
CREATE TYPE public.company_status AS ENUM ('active', 'trial', 'churned');
CREATE TYPE public.company_plan AS ENUM ('Starter', 'Growth', 'Enterprise');
CREATE TYPE public.job_type AS ENUM ('Full-time', 'Part-time', 'Contract');
CREATE TYPE public.job_status AS ENUM ('open', 'filled', 'closed');
CREATE TYPE public.application_stage AS ENUM ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected');
CREATE TYPE public.contract_status AS ENUM ('active', 'completed', 'draft');
CREATE TYPE public.payment_direction AS ENUM ('in', 'out');
CREATE TYPE public.payment_status AS ENUM ('paid', 'pending', 'failed');

-- =========================================================================
-- TIMESTAMP TRIGGER
-- =========================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========================================================================
-- PROFILES
-- =========================================================================
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- USER ROLES
-- =========================================================================
CREATE TABLE public.user_roles (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','recruiter'))
$$;

-- =========================================================================
-- FREELANCER PROFILES
-- =========================================================================
CREATE TABLE public.freelancer_profiles (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  bio TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  rate NUMERIC(10,2),
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  location TEXT,
  availability TEXT,
  status freelancer_status NOT NULL DEFAULT 'pending',
  avatar_color TEXT NOT NULL DEFAULT '#7c5cff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.freelancer_profiles TO authenticated;
GRANT ALL ON public.freelancer_profiles TO service_role;
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_flr_updated BEFORE UPDATE ON public.freelancer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- COMPANIES + MEMBERS
-- =========================================================================
CREATE TABLE public.companies (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  contact_name TEXT,
  email TEXT,
  status company_status NOT NULL DEFAULT 'trial',
  plan company_plan NOT NULL DEFAULT 'Starter',
  spend NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.company_members (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.company_members TO authenticated;
GRANT ALL ON public.company_members TO service_role;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_company_member(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members WHERE user_id = _user_id AND company_id = _company_id)
$$;

-- =========================================================================
-- JOBS
-- =========================================================================
CREATE TABLE public.jobs (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type job_type NOT NULL DEFAULT 'Contract',
  budget NUMERIC(12,2),
  status job_status NOT NULL DEFAULT 'open',
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- APPLICATIONS + NOTES
-- =========================================================================
CREATE TABLE public.applications (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage application_stage NOT NULL DEFAULT 'applied',
  match INTEGER NOT NULL DEFAULT 0,
  cover_letter TEXT,
  recruiter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, freelancer_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_applications_updated BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.application_notes (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.application_notes TO authenticated;
GRANT ALL ON public.application_notes TO service_role;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- CONTRACTS
-- =========================================================================
CREATE TABLE public.contracts (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  role TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  value NUMERIC(12,2) NOT NULL DEFAULT 0,
  status contract_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT ALL ON public.contracts TO service_role;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_contracts_updated BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- PAYMENTS
-- =========================================================================
CREATE TABLE public.payments (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice TEXT NOT NULL UNIQUE,
  party TEXT NOT NULL,
  party_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  party_company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  direction payment_direction NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- RLS POLICIES
-- =========================================================================

-- profiles
CREATE POLICY "Profiles readable by everyone signed in" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- user_roles
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- freelancer_profiles
CREATE POLICY "Freelancer profiles readable by signed-in" ON public.freelancer_profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Freelancer manages own profile" ON public.freelancer_profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- companies
CREATE POLICY "Companies readable by signed-in" ON public.companies
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage companies" ON public.companies
  FOR ALL TO authenticated USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Company members update own company" ON public.companies
  FOR UPDATE TO authenticated USING (public.is_company_member(auth.uid(), id))
  WITH CHECK (public.is_company_member(auth.uid(), id));

-- company_members
CREATE POLICY "Members see own memberships" ON public.company_members
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage memberships" ON public.company_members
  FOR ALL TO authenticated USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- jobs
CREATE POLICY "Jobs readable by signed-in" ON public.jobs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage jobs" ON public.jobs
  FOR ALL TO authenticated USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Company members manage own jobs" ON public.jobs
  FOR ALL TO authenticated USING (public.is_company_member(auth.uid(), company_id))
  WITH CHECK (public.is_company_member(auth.uid(), company_id));

-- applications
CREATE POLICY "Freelancer sees own applications" ON public.applications
  FOR SELECT TO authenticated USING (auth.uid() = freelancer_id OR public.is_staff(auth.uid()));
CREATE POLICY "Freelancer creates own application" ON public.applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = freelancer_id);
CREATE POLICY "Freelancer withdraws own application" ON public.applications
  FOR DELETE TO authenticated USING (auth.uid() = freelancer_id);
CREATE POLICY "Staff manage applications" ON public.applications
  FOR ALL TO authenticated USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- application_notes
CREATE POLICY "Staff read notes" ON public.application_notes
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff add notes" ON public.application_notes
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) AND auth.uid() = author_id);
CREATE POLICY "Staff delete own notes" ON public.application_notes
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()) AND auth.uid() = author_id);

-- contracts
CREATE POLICY "Freelancer sees own contracts" ON public.contracts
  FOR SELECT TO authenticated USING (auth.uid() = freelancer_id OR public.is_staff(auth.uid()) OR public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Staff manage contracts" ON public.contracts
  FOR ALL TO authenticated USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- payments
CREATE POLICY "Staff manage payments" ON public.payments
  FOR ALL TO authenticated USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Freelancer sees own payouts" ON public.payments
  FOR SELECT TO authenticated USING (auth.uid() = party_user_id OR public.is_staff(auth.uid()));

-- =========================================================================
-- AUTH TRIGGER — auto-create profile + role + freelancer profile on signup
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role app_role;
  _name TEXT;
BEGIN
  _name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, _name)
    ON CONFLICT (id) DO NOTHING;

  _role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'freelancer');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
    ON CONFLICT DO NOTHING;

  IF _role = 'freelancer' THEN
    INSERT INTO public.freelancer_profiles (user_id, status)
      VALUES (NEW.id, 'pending')
      ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_company_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
CREATE TYPE public.app_role AS ENUM ('admin', 'recruiter', 'freelancer', 'company');
CREATE TYPE public.freelancer_status AS ENUM ('active', 'pending', 'suspended');
CREATE TYPE public.company_status AS ENUM ('active', 'trial', 'churned');
CREATE TYPE public.company_plan AS ENUM ('Starter', 'Growth', 'Enterprise');
CREATE TYPE public.job_type AS ENUM ('Full-time', 'Part-time', 'Contract');
CREATE TYPE public.job_status AS ENUM ('open', 'filled', 'closed');
CREATE TYPE public.application_stage AS ENUM ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected');
CREATE TYPE public.contract_status AS ENUM ('active', 'completed', 'draft');
CREATE TYPE public.payment_direction AS ENUM ('in', 'out');
CREATE TYPE public.payment_status AS ENUM ('paid', 'pending', 'failed');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_roles (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','recruiter'))
$$;

CREATE TABLE public.freelancer_profiles (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  bio TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  rate NUMERIC(10,2),
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  location TEXT,
  availability TEXT,
  status freelancer_status NOT NULL DEFAULT 'pending',
  avatar_color TEXT NOT NULL DEFAULT '#7c5cff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.freelancer_profiles TO authenticated;
GRANT ALL ON public.freelancer_profiles TO service_role;
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_flr_updated BEFORE UPDATE ON public.freelancer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.companies (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  contact_name TEXT,
  email TEXT,
  status company_status NOT NULL DEFAULT 'trial',
  plan company_plan NOT NULL DEFAULT 'Starter',
  spend NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.company_members (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.company_members TO authenticated;
GRANT ALL ON public.company_members TO service_role;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_company_member(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members WHERE user_id = _user_id AND company_id = _company_id)
$$;

CREATE TABLE public.jobs (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type job_type NOT NULL DEFAULT 'Contract',
  budget NUMERIC(12,2),
  status job_status NOT NULL DEFAULT 'open',
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.applications (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage application_stage NOT NULL DEFAULT 'applied',
  match INTEGER NOT NULL DEFAULT 0,
  cover_letter TEXT,
  recruiter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, freelancer_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_applications_updated BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.application_notes (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.application_notes TO authenticated;
GRANT ALL ON public.application_notes TO service_role;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.contracts (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  role TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  value NUMERIC(12,2) NOT NULL DEFAULT 0,
  status contract_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT ALL ON public.contracts TO service_role;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_contracts_updated BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.payments (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice TEXT NOT NULL UNIQUE,
  party TEXT NOT NULL,
  party_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  party_company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL,
  direction payment_direction NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Profiles readable by everyone signed in" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE POLICY "Freelancer profiles readable by signed-in" ON public.freelancer_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Freelancer manages own profile" ON public.freelancer_profiles FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid())) WITH CHECK (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE POLICY "Companies readable by signed-in" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage companies" ON public.companies FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Company members update own company" ON public.companies FOR UPDATE TO authenticated USING (public.is_company_member(auth.uid(), id)) WITH CHECK (public.is_company_member(auth.uid(), id));

CREATE POLICY "Members see own memberships" ON public.company_members FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage memberships" ON public.company_members FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Jobs readable by signed-in" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage jobs" ON public.jobs FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Company members manage own jobs" ON public.jobs FOR ALL TO authenticated USING (public.is_company_member(auth.uid(), company_id)) WITH CHECK (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Freelancer sees own applications" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = freelancer_id OR public.is_staff(auth.uid()));
CREATE POLICY "Freelancer creates own application" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = freelancer_id);
CREATE POLICY "Freelancer withdraws own application" ON public.applications FOR DELETE TO authenticated USING (auth.uid() = freelancer_id);
CREATE POLICY "Staff manage applications" ON public.applications FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff read notes" ON public.application_notes FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff add notes" ON public.application_notes FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) AND auth.uid() = author_id);
CREATE POLICY "Staff delete own notes" ON public.application_notes FOR DELETE TO authenticated USING (public.is_staff(auth.uid()) AND auth.uid() = author_id);

CREATE POLICY "Freelancer sees own contracts" ON public.contracts FOR SELECT TO authenticated USING (auth.uid() = freelancer_id OR public.is_staff(auth.uid()) OR public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Staff manage contracts" ON public.contracts FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff manage payments" ON public.payments FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Freelancer sees own payouts" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = party_user_id OR public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role app_role;
  _name TEXT;
BEGIN
  _name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, _name)
    ON CONFLICT (id) DO NOTHING;

  _role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'freelancer');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
    ON CONFLICT DO NOTHING;

  IF _role = 'freelancer' THEN
    INSERT INTO public.freelancer_profiles (user_id, status)
      VALUES (NEW.id, 'pending')
      ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_company_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.freelancer_profiles TO authenticated;
GRANT ALL ON public.freelancer_profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_members TO authenticated;
GRANT ALL ON public.company_members TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_notes TO authenticated;
GRANT ALL ON public.application_notes TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT ALL ON public.contracts TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

GRANT USAGE ON TYPE public.app_role TO authenticated;
GRANT USAGE ON TYPE public.app_role TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_member(uuid, uuid) TO authenticated;REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_company_member(uuid, uuid) FROM anon, authenticated, PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_company_member(uuid, uuid) TO service_role;GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_company_member(uuid, uuid) TO authenticated, anon;
CREATE TABLE IF NOT EXISTS public.freelancer_onboarding (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  completion INT NOT NULL DEFAULT 0,
  talent_score INT NOT NULL DEFAULT 0,
  recruiter_notes TEXT,
  recruiter_assessment JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.freelancer_onboarding TO authenticated;
GRANT ALL ON public.freelancer_onboarding TO service_role;

ALTER TABLE public.freelancer_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Freelancers manage own onboarding"
  ON public.freelancer_onboarding FOR ALL
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE TRIGGER update_freelancer_onboarding_updated_at
  BEFORE UPDATE ON public.freelancer_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TYPE public.timesheet_status AS ENUM ('draft','submitted','approved','rejected');

CREATE TABLE public.timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  hours NUMERIC(6,2) NOT NULL DEFAULT 0,
  notes TEXT,
  status public.timesheet_status NOT NULL DEFAULT 'draft',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contract_id, week_start)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.timesheets TO authenticated;
GRANT ALL ON public.timesheets TO service_role;

ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Freelancer reads own timesheets" ON public.timesheets
  FOR SELECT TO authenticated
  USING (auth.uid() = freelancer_id OR public.is_staff(auth.uid())
         OR EXISTS (SELECT 1 FROM public.contracts c
                     WHERE c.id = contract_id
                       AND public.is_company_member(auth.uid(), c.company_id)));

CREATE POLICY "Freelancer inserts own timesheets" ON public.timesheets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Freelancer updates own draft/submitted" ON public.timesheets
  FOR UPDATE TO authenticated
  USING (auth.uid() = freelancer_id AND status IN ('draft','submitted'))
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Staff manages timesheets" ON public.timesheets
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER tg_timesheets_updated_at
  BEFORE UPDATE ON public.timesheets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS policies for the private talent-uploads bucket
CREATE POLICY "Talent can read own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'talent-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Talent can upload to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'talent-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Talent can update own files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'talent-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Talent can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'talent-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Staff can read all talent files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'talent-uploads' AND public.is_staff(auth.uid()));
