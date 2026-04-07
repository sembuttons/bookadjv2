"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

export function EnsurePublicUserRow({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        router.replace("/auth");
        return;
      }

      // Auto-create user row if it doesn't exist
      await supabase.from("users").upsert(
        {
          id: session.user.id,
          email: session.user.email,
          role: (session.user.user_metadata?.role as string | undefined) ?? "klant",
          full_name:
            (session.user.user_metadata?.full_name as string | undefined) ?? null,
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}

