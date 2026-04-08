ALTER TABLE public.dj_profiles
  ADD COLUMN IF NOT EXISTS equipment jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.dj_profiles
  ADD COLUMN IF NOT EXISTS custom_equipment text;
