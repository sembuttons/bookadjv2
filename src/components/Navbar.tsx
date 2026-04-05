"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

function initialsFromUser(fullName: string | null, email: string | null) {
  if (fullName?.trim()) {
    const parts = fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "");
    const s = parts.join("");
    if (s) return s;
  }
  if (email?.trim()) {
    const ch = email.trim()[0];
    return ch ? ch.toUpperCase() : "?";
  }
  return "?";
}

function normalizeRole(dbRole: string | null | undefined): string | null {
  if (!dbRole) return null;
  const r = dbRole.toLowerCase();
  if (r === "klant") return "customer";
  return r;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const refreshUserRow = useCallback(async (userId: string, s: Session) => {
    const { data: row } = await supabase
      .from("users")
      .select("full_name, role")
      .eq("id", userId)
      .maybeSingle();

    const r = row as { full_name?: string; role?: string } | null;
    setFullName(
      r?.full_name?.trim() ||
        (s.user.user_metadata?.full_name as string | undefined)?.trim() ||
        null,
    );
    setEmail(s.user.email ?? null);
    setRole(normalizeRole(r?.role) ?? normalizeRole(s.user.user_metadata?.role as string));
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const {
        data: { session: s },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(s);
      if (s?.user) await refreshUserRow(s.user.id, s);
      else {
        setFullName(null);
        setEmail(null);
        setRole(null);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) void refreshUserRow(s.user.id, s);
      else {
        setFullName(null);
        setEmail(null);
        setRole(null);
        setUnread(0);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [refreshUserRow]);

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;
    void (async () => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", session.user.id)
        .eq("is_read", false);
      if (!cancelled) setUnread(count ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [session, pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || buttonRef.current?.contains(t))
        return;
      setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const displayRole = role;
  const isDj = displayRole === "dj";
  const isAdmin = displayRole === "admin";

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white shadow-sm">
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-xl font-semibold tracking-tight text-neutral-900"
        >
          bookadj
        </Link>

        <nav
          className="order-last flex w-full justify-center gap-6 text-sm font-medium text-neutral-700 md:order-none md:absolute md:left-1/2 md:w-auto md:-translate-x-1/2 md:gap-8"
          aria-label="Hoofdnavigatie"
        >
          <Link href="/zoeken" className="transition-colors hover:text-neutral-900">
            DJ&apos;s vinden
          </Link>
          <Link href="/hoe-het-werkt" className="transition-colors hover:text-neutral-900">
            Hoe het werkt
          </Link>
          <Link href="/voor-djs" className="transition-colors hover:text-neutral-900">
            Voor DJ&apos;s
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {!session ? (
            <>
              <Link
                href="/auth"
                className="text-sm font-medium text-neutral-800 transition-colors hover:text-neutral-900"
              >
                Inloggen
              </Link>
              <Link
                href="/auth?tab=aanmelden"
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800"
              >
                Aanmelden
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                ref={buttonRef}
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-neutral-400"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Accountmenu"
              >
                {initialsFromUser(fullName, email)}
              </button>
              {menuOpen ? (
                <div
                  ref={menuRef}
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 min-w-[260px] rounded-xl border border-neutral-200 bg-white py-2 shadow-lg"
                >
                  <div className="px-4 py-2 text-left">
                    <p className="text-sm font-semibold text-neutral-400">
                      {fullName || "Account"}
                    </p>
                    <p className="truncate text-xs text-neutral-400">{email}</p>
                  </div>
                  <div className="my-2 border-t border-neutral-100" role="separator" />
                  <Link
                    href="/dashboard/klant"
                    role="menuitem"
                    className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mijn boekingen
                  </Link>
                  <Link
                    href="/berichten"
                    role="menuitem"
                    className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>Berichten</span>
                    {unread > 0 ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    ) : null}
                  </Link>
                  <Link
                    href="/dashboard/klant/reviews"
                    role="menuitem"
                    className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mijn reviews
                  </Link>
                  <Link
                    href="/dashboard/klant/profiel"
                    role="menuitem"
                    className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profiel
                  </Link>
                  <div className="my-2 border-t border-neutral-100" role="separator" />
                  {!isDj ? (
                    <Link
                      href="/voor-djs"
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Voor DJ&apos;s
                    </Link>
                  ) : null}
                  {isDj ? (
                    <Link
                      href="/dashboard/dj"
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      DJ Dashboard
                    </Link>
                  ) : null}
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  ) : null}
                  <div className="my-2 border-t border-neutral-100" role="separator" />
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-neutral-50"
                    onClick={() => void handleSignOut()}
                  >
                    Uitloggen
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
