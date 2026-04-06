-- DJ blocked dates for calendar / booking UI
CREATE TABLE IF NOT EXISTS public.dj_availability (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dj_id uuid NOT NULL REFERENCES public.dj_profiles (id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (dj_id, blocked_date)
);

CREATE INDEX IF NOT EXISTS idx_dj_availability_dj_id ON public.dj_availability (dj_id);

ALTER TABLE public.dj_profiles
  ADD COLUMN IF NOT EXISTS photos jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.dj_profiles
  ADD COLUMN IF NOT EXISTS video_url text;

ALTER TABLE public.dj_availability ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) can read blocked dates for booking calendar
CREATE POLICY "dj_availability_select_public"
  ON public.dj_availability
  FOR SELECT
  USING (true);

CREATE POLICY "dj_availability_insert_own"
  ON public.dj_availability
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.dj_profiles p
      WHERE p.id = dj_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "dj_availability_delete_own"
  ON public.dj_availability
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.dj_profiles p
      WHERE p.id = dj_id AND p.user_id = auth.uid()
    )
  );
