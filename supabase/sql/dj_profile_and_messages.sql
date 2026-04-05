-- Run in Supabase SQL editor (profile columns from product spec)
ALTER TABLE dj_profiles ADD COLUMN IF NOT EXISTS custom_usps jsonb;
ALTER TABLE dj_profiles ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE dj_profiles ADD COLUMN IF NOT EXISTS soundcloud_url text;

-- Messages for "Stel een vraag" (ask_me). Adjust RLS policies to match your auth model.
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  inbox_type text NOT NULL,
  sender_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  booking_id uuid,
  body text NOT NULL
);

CREATE INDEX IF NOT EXISTS messages_recipient_id_idx ON messages (recipient_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages (sender_id);
