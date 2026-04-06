-- Gelegenheden waarvoor een DJ beschikbaar is (jsonb array van string ids, zie src/lib/occasions.ts)
ALTER TABLE public.dj_profiles
  ADD COLUMN IF NOT EXISTS occasions jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.dj_profiles.occasions IS
  'Array van occasion-id''s (bruiloft, festival, …). Leeg = legacy / alle gelegenheden in zoekfilters.';
