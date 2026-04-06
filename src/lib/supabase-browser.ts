"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client: persists auth in cookies so `src/proxy.ts` (SSR) can read the session.
 * Do not use this in Server Components — use `@/lib/supabase` instead.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
