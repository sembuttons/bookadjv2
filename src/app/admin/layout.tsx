"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

const nav = [
  { href: "/admin", label: "Dashboard", match: "exact" as const },
  { href: "/admin/verificaties", label: "DJ Verificaties", match: "prefix" as const },
  { href: "/admin/boekingen", label: "Boekingen", match: "prefix" as const },
  { href: "/admin/berichten", label: "Berichten", match: "prefix" as const },
  { href: "/admin/gebruikers", label: "Gebruikers", match: "prefix" as const },
  { href: "/admin/geschillen", label: "Geschillen", match: "prefix" as const },
];

function linkActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        router.replace("/");
        return;
      }
      const { data: row, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !row || (row as { role?: string }).role !== "admin") {
        router.replace("/");
        return;
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] font-sans text-white">
        <p className="text-gray-400">Laden…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] font-sans text-white">
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-900 bg-[#0f0f0f] lg:w-60">
        <div className="px-4 py-5">
          <Link
            href="/admin"
            className="text-lg font-bold tracking-tight text-green-400"
          >
            bookadj
          </Link>
          <p className="mt-1 text-xs font-medium text-gray-500">Admin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Admin navigatie">
          {nav.map((item) => {
            const active = linkActive(pathname, item.href, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-r-2 border-green-500 bg-green-500/10 text-green-400"
                    : "text-gray-400 hover:bg-gray-900 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:ring-1 hover:ring-red-800 disabled:opacity-50"
          >
            {loggingOut ? "Bezig…" : "Uitloggen"}
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto bg-[#0a0a0a] px-4 py-8 sm:px-6 lg:px-10">
        {children}
      </main>
    </div>
  );
}
