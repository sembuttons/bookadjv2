"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-browser";

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const displayRole = role;
  const isDj = displayRole === "dj";
  const isAdmin = displayRole === "admin";
  const isCustomer = !isDj && !isAdmin;

  const BerichtenMenuItem = (
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
  );

  const navLinkClass =
    "py-2 text-sm font-medium text-neutral-800 transition-all duration-200 hover:text-bookadj md:py-0";

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white shadow-sm">
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[45] bg-black/40 md:hidden"
          aria-label="Menu sluiten"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-xl font-semibold tracking-tight text-neutral-900"
        >
          bookadj
        </Link>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm font-medium text-neutral-700 md:flex"
          aria-label="Hoofdnavigatie"
        >
          <Link href="/zoeken" className={navLinkClass}>
            DJ&apos;s vinden
          </Link>
          <Link href="/hoe-het-werkt" className={navLinkClass}>
            Hoe het werkt
          </Link>
          <Link href="/voor-djs" className={navLinkClass}>
            Voor DJ&apos;s
          </Link>
          <Link href="/contact" className={navLinkClass}>
            Contact
          </Link>
          <Link href="/over-ons" className={navLinkClass}>
            Over ons
          </Link>
        </nav>

        <div className="flex-1" />

        <div
          className={`fixed inset-y-0 right-0 z-[48] w-[min(20rem,88vw)] max-w-full transform border-l border-neutral-200 bg-white shadow-xl transition-transform duration-200 ease-out md:hidden ${
            mobileNavOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-hidden={!mobileNavOpen}
          id="site-mobile-nav"
        >
          <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
            <span className="text-sm font-bold">Menu</span>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
              aria-label="Menu sluiten"
              onClick={() => setMobileNavOpen(false)}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-3" aria-label="Mobiel menu">
            <Link href="/zoeken" className={`rounded-lg px-3 ${navLinkClass}`} onClick={() => setMobileNavOpen(false)}>
              DJ&apos;s vinden
            </Link>
            <Link href="/hoe-het-werkt" className={`rounded-lg px-3 ${navLinkClass}`} onClick={() => setMobileNavOpen(false)}>
              Hoe het werkt
            </Link>
            <Link href="/voor-djs" className={`rounded-lg px-3 ${navLinkClass}`} onClick={() => setMobileNavOpen(false)}>
              Voor DJ&apos;s
            </Link>
            <Link href="/over-ons" className={`rounded-lg px-3 ${navLinkClass}`} onClick={() => setMobileNavOpen(false)}>
              Over ons
            </Link>
            <Link href="/support" className={`rounded-lg px-3 ${navLinkClass}`} onClick={() => setMobileNavOpen(false)}>
              Support
            </Link>
            <Link href="/contact" className={`rounded-lg px-3 ${navLinkClass}`} onClick={() => setMobileNavOpen(false)}>
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-200 text-neutral-800 shadow-sm transition-all duration-200 hover:bg-neutral-50 md:hidden"
            aria-expanded={mobileNavOpen}
            aria-controls="site-mobile-nav"
            aria-label="Menu openen"
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {!session ? (
            <>
              <Link
                href="/auth"
                className="text-sm font-medium text-neutral-800 transition-all duration-200 hover:text-bookadj"
              >
                Inloggen
              </Link>
              <Link
                href="/auth?tab=aanmelden"
                className="rounded-lg bg-bookadj px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-bookadj-hover min-[380px]:px-4"
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
                  {isAdmin ? (
                    <>
                      <Link
                        href="/admin"
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin panel
                      </Link>
                      {BerichtenMenuItem}
                    </>
                  ) : null}
                  {isDj && !isAdmin ? (
                    <>
                      <Link
                        href="/dashboard/dj"
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Mijn boekingen
                      </Link>
                      {BerichtenMenuItem}
                      <Link
                        href="/dashboard/dj"
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        DJ Dashboard
                      </Link>
                      <Link
                        href="/dashboard/dj/profiel"
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Mijn profiel
                      </Link>
                    </>
                  ) : null}
                  {isCustomer ? (
                    <>
                      <Link
                        href="/dashboard/klant"
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Mijn boekingen
                      </Link>
                      {BerichtenMenuItem}
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
                    </>
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
