"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardShellSkeleton } from "@/components/skeleton";
import { supabase } from "@/lib/supabase-browser";

export type DashboardExpectedRole = "klant" | "dj" | "auto";

type NavItem = {
  key: string;
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
  unreadBadge?: boolean;
};

function klantNav(): NavItem[] {
  return [
    {
      key: "boekingen",
      label: "Mijn boekingen",
      href: "/dashboard/klant",
      isActive: (p) => p === "/dashboard/klant",
    },
    {
      key: "berichten",
      label: "Berichten",
      href: "/berichten",
      isActive: (p) => p === "/berichten" || p.startsWith("/berichten/"),
      unreadBadge: true,
    },
    {
      key: "reviews",
      label: "Mijn reviews",
      href: "/dashboard/klant/reviews",
      isActive: (p) =>
        p === "/dashboard/klant/reviews" ||
        p.startsWith("/dashboard/klant/reviews/"),
    },
    {
      key: "profiel",
      label: "Profiel",
      href: "/dashboard/klant/profiel",
      isActive: (p) =>
        p === "/dashboard/klant/profiel" ||
        p.startsWith("/dashboard/klant/profiel/"),
    },
  ];
}

function djNav(): NavItem[] {
  return [
    {
      key: "boekingen",
      label: "Boekingen",
      href: "/dashboard/dj",
      isActive: (p) =>
        p === "/dashboard/dj" || p.startsWith("/dashboard/dj/bevestigd"),
    },
    {
      key: "berichten",
      label: "Berichten",
      href: "/berichten",
      isActive: (p) => p === "/berichten" || p.startsWith("/berichten/"),
      unreadBadge: true,
    },
    {
      key: "profiel",
      label: "Mijn profiel",
      href: "/dashboard/dj/profiel",
      isActive: (p) => p.startsWith("/dashboard/dj/profiel"),
    },
    {
      key: "kalender",
      label: "Beschikbaarheid",
      href: "/dashboard/dj/kalender",
      isActive: (p) => p.startsWith("/dashboard/dj/kalender"),
    },
    {
      key: "uitbetalingen",
      label: "Uitbetalingen",
      href: "/dashboard/dj/uitbetalingen",
      isActive: (p) => p.startsWith("/dashboard/dj/uitbetalingen"),
    },
  ];
}

function isDjFromSession(session: {
  user: { user_metadata?: Record<string, unknown> };
}): boolean {
  const r = session.user.user_metadata?.role;
  return typeof r === "string" && r.toLowerCase() === "dj";
}

export function DashboardAppShell({
  children,
  expectedRole,
  defaultContentPadding = true,
}: {
  children: React.ReactNode;
  expectedRole: DashboardExpectedRole;
  /** When false, children control horizontal/vertical padding (e.g. berichten). */
  defaultContentPadding?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [sidebarRole, setSidebarRole] = useState<"klant" | "dj">("klant");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

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

      const isDj = isDjFromSession(session);

      if (expectedRole === "klant" && isDj) {
        router.replace("/dashboard/dj");
        return;
      }
      if (expectedRole === "dj" && !isDj) {
        router.replace("/dashboard/klant");
        return;
      }

      const roleForNav: "klant" | "dj" =
        expectedRole === "auto" ? (isDj ? "dj" : "klant") : expectedRole;

      setSidebarRole(roleForNav);
      setUserEmail(session.user.email ?? null);
      setReady(true);

      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", session.user.id)
        .eq("is_read", false);
      if (!cancelled) setUnreadMessages(count ?? 0);
    })();

    return () => {
      cancelled = true;
    };
  }, [router, expectedRole]);

  useEffect(() => {
    if (!ready) return;
    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", session.user.id)
        .eq("is_read", false);
      setUnreadMessages(count ?? 0);
    })();
  }, [ready, pathname]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    setMobileNavOpen(false);
    await supabase.auth.signOut();
    router.replace("/auth");
    router.refresh();
  }, [router]);

  const navItems = sidebarRole === "dj" ? djNav() : klantNav();

  const renderNavLinks = (onNavigate?: () => void) =>
    navItems.map((item) => {
      const active = item.isActive(pathname);
      return (
        <Link
          key={item.key}
          href={item.href}
          onClick={() => onNavigate?.()}
          className={`relative flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:border-l-[3px] ${
            active
              ? "bg-neutral-900 text-white md:border-bookadj md:bg-bookadj/10 md:text-neutral-900 md:shadow-sm"
              : "text-neutral-700 hover:bg-neutral-100 md:border-transparent"
          }`}
        >
          <span className="min-w-0 flex-1">{item.label}</span>
          {item.unreadBadge && unreadMessages > 0 ? (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white md:bg-orange-500">
              {unreadMessages > 9 ? "9+" : unreadMessages}
            </span>
          ) : null}
        </Link>
      );
    });

  if (!ready || !userEmail) {
    return (
      <div className="min-h-screen bg-white font-sans text-neutral-900">
        <Navbar />
        <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
          <DashboardShellSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <Navbar />

      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-black/40 md:hidden"
          aria-label="Menu sluiten"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <div className="mx-auto flex max-w-[1600px] flex-col md:flex-row">
        {/* Desktop sidebar */}
        <aside
          className="hidden w-56 shrink-0 border-b-0 border-r border-neutral-200 bg-white md:block lg:w-60"
          aria-label={
            sidebarRole === "dj" ? "DJ-dashboard navigatie" : "Dashboard navigatie"
          }
        >
          <nav className="flex flex-col gap-0.5 p-4">
            {renderNavLinks()}
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="mt-3 border-t border-neutral-200 pt-4 text-left text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900 disabled:opacity-50"
            >
              Uitloggen
            </button>
          </nav>
        </aside>

        {/* Mobile drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-[60] w-[min(18rem,100vw)] max-w-full transform border-r border-neutral-200 bg-white shadow-xl transition-transform duration-200 ease-out md:hidden ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-hidden={!mobileNavOpen}
          id="dashboard-mobile-nav"
        >
          <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
            <span className="text-sm font-bold text-neutral-900">Menu</span>
            <button
              type="button"
              className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
              aria-label="Menu sluiten"
              onClick={() => setMobileNavOpen(false)}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
              >
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <nav
            className="flex flex-col gap-0.5 p-3"
            aria-label={
              sidebarRole === "dj" ? "DJ-dashboard navigatie" : "Dashboard navigatie"
            }
          >
            {renderNavLinks(() => setMobileNavOpen(false))}
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="mt-3 rounded-lg border-t border-neutral-200 pt-4 text-left text-sm font-medium text-neutral-700 disabled:opacity-50"
            >
              Uitloggen
            </button>
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <div className="sticky top-[52px] z-40 flex items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-3 py-2.5 md:hidden">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-800 shadow-sm"
              aria-expanded={mobileNavOpen}
              aria-controls="dashboard-mobile-nav"
              aria-label="Menu openen"
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 5h14M3 10h14M3 15h14"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-neutral-900">
                Dashboard
              </p>
              <p className="truncate text-xs text-neutral-500">
                {sidebarRole === "dj" ? "DJ" : "Klant"}
              </p>
            </div>
          </div>

          <main className="min-w-0 flex-1">
            {defaultContentPadding ? (
              <div className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
                {children}
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
