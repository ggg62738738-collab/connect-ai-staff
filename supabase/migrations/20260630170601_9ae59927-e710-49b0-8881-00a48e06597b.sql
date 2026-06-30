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
