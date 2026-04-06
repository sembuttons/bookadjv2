"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase-browser";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        router.replace("/auth");
        return;
      }

      const role = session.user.user_metadata?.role as string | undefined;
      if (role === "dj") {
        router.replace("/dashboard/dj");
        return;
      }

      router.replace("/dashboard/klant");
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111827] px-4">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
    </div>
  );
}
