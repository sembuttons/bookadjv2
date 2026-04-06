import { createClient } from "@supabase/supabase-js";

/**
 * Server / RSC client (localStorage-free). For interactive auth in the browser use
 * `@/lib/supabase-browser` so sessions are stored in cookies for `proxy.ts`.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);