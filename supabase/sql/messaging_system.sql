-- Messaging system (run in Supabase SQL editor after reviewing)
-- Enable Realtime: Dashboard → Database → Replication → add `messages` if you use live updates.

ALTER TABLE users ADD COLUMN IF NOT EXISTS offense_count int DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  sender_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  booking_id uuid,
  inbox_type text NOT NULL DEFAULT 'ask_me',
  content text NOT NULL DEFAULT '',
  body text,
  is_flagged boolean NOT NULL DEFAULT false,
  flag_reason text,
  is_read boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS messages_participants_idx ON messages (sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS messages_recipient_unread_idx ON messages (recipient_id) WHERE is_read = false;

-- Messages: use `content` as primary body (migrate from `body` if you had it)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS content text;
UPDATE messages SET content = COALESCE(content, body) WHERE content IS NULL AND body IS NOT NULL;
ALTER TABLE messages ALTER COLUMN content SET DEFAULT '';
-- If you require NOT NULL, backfill then:
-- UPDATE messages SET content = '' WHERE content IS NULL;
-- ALTER TABLE messages ALTER COLUMN content SET NOT NULL;

ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS flag_reason text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gebruikers zien eigen berichten" ON messages;
CREATE POLICY "Gebruikers zien eigen berichten"
ON messages FOR SELECT
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

DROP POLICY IF EXISTS "Gebruikers updaten ontvangen ongelezen" ON messages;
CREATE POLICY "Gebruikers updaten ontvangen ongelezen"
ON messages FOR UPDATE
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- Inserts go via service role (API). Optional direct insert:
DROP POLICY IF EXISTS "Gebruikers versturen als afzender" ON messages;
CREATE POLICY "Gebruikers versturen als afzender"
ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- Note: service_role JWT bypasses RLS in Supabase; no separate policy required.

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type text NOT NULL,
  channel text,
  payload jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS notifications_user_sent_idx
ON notifications (user_id, type, sent_at DESC);

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  admin_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb
);
