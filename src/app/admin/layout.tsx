"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type MatchMode = "exact" | "prefix";

type NavDef = {
  href: string;
  label: string;
  match: MatchMode;
  badge?: "bookings" | "verifications" | "messages";
};

const NAV: NavDef[] = [
  { href: "/admin", label: "Dashboard", match: "exact" },
  { href: "/admin/boekingen", label: "Boekingen", match: "prefix", badge: "bookings" },
  {
    href: "/admin/verificaties",
    label: "Verificaties",
    match: "prefix",
    badge: "verifications",
  },
  { href: "/admin/berichten", label: "Berichten", match: "prefix", badge: "messages" },
  { href: "/admin/gebruikers", label: "Gebruikers", match: "prefix" },
  { href: "/admin/geschillen", label: "Geschillen", match: "prefix" },
];

function linkActive(pathname: string, href: string, match: MatchMode) {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavBadge({
  count,
  variant,
}: {
  count: number;
  variant: "default" | "danger";
}) {
  if (count <= 0) return null;
  return (
    <span
      className={`ml-2 inline-flex min-w-[1.25rem] justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
        variant === "danger"
          ? "bg-red-500 text-white"
          : "bg-amber-500 text-black"
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [counts, setCounts] = useState({
    bookings: 0,
    verifications: 0,
    messages: 0,
  });

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

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token || cancelled) return;
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok || cancelled) return;
      const j = (await res.json()) as {
        pendingBookings?: number;
        pendingVerifications?: number;
        flaggedMessages?: number;
      };
      setCounts({
        bookings: j.pendingBookings ?? 0,
        verifications: j.pendingVerifications ?? 0,
        messages: j.flaggedMessages ?? 0,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, pathname]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] font-sans text-slate-900">
        <p className="text-gray-500">Laden…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white shadow-sm lg:w-60">
        <div className="px-4 py-5">
          <Link
            href="/admin"
            className="text-lg font-bold tracking-tight text-green-600"
          >
            bookadj
          </Link>
          <p className="mt-1 text-xs font-medium text-gray-500">Admin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Admin navigatie">
          {NAV.map((item) => {
            const active = linkActive(pathname, item.href, item.match);
            const badgeCount =
              item.badge === "bookings"
                ? counts.bookings
                : item.badge === "verifications"
                  ? counts.verifications
                  : item.badge === "messages"
                    ? counts.messages
                    : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-r-2 border-green-500 bg-green-50 text-green-800"
                    : "text-gray-600 hover:bg-gray-100 hover:text-slate-900"
                }`}
              >
                <span className="flex-1">{item.label}</span>
                {item.badge === "messages" ? (
                  <NavBadge count={badgeCount} variant="danger" />
                ) : item.badge ? (
                  <NavBadge count={badgeCount} variant="default" />
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:ring-1 hover:ring-red-200 disabled:opacity-50"
          >
            {loggingOut ? "Bezig…" : "Uitloggen"}
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-10">
        {children}
      </main>
    </div>
  );
}
