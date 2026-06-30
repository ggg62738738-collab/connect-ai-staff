
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
