"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ClipboardList,
  Image as ImageIcon,
  MessageSquare,
  Star,
  User,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DashboardShellSkeleton } from "@/components/skeleton";
import { supabase } from "@/lib/supabase-browser";

export type DashboardExpectedRole = "klant" | "dj" | "auto";

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
  unreadBadge?: boolean;
};

function klantNav(): NavItem[] {
  return [
    {
      key: "boekingen",
      label: "Mijn boekingen",
      href: "/dashboard/klant",
      icon: ClipboardList,
      isActive: (p) => p === "/dashboard/klant",
    },
    {
      key: "berichten",
      label: "Berichten",
      href: "/berichten",
      icon: MessageSquare,
      isActive: (p) => p === "/berichten" || p.startsWith("/berichten/"),
      unreadBadge: true,
    },
    {
      key: "reviews",
      label: "Mijn reviews",
      href: "/dashboard/klant/reviews",
      icon: Star,
      isActive: (p) =>
        p === "/dashboard/klant/reviews" ||
        p.startsWith("/dashboard/klant/reviews/"),
    },
    {
      key: "profiel",
      label: "Profiel",
      href: "/dashboard/klant/profiel",
      icon: User,
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
      icon: ClipboardList,
      isActive: (p) =>
        p === "/dashboard/dj" || p.startsWith("/dashboard/dj/bevestigd"),
    },
    {
      key: "berichten",
      label: "Berichten",
      href: "/berichten",
      icon: MessageSquare,
      isActive: (p) => p === "/berichten" || p.startsWith("/berichten/"),
      unreadBadge: true,
    },
    {
      key: "profiel",
      label: "Mijn profiel",
      href: "/dashboard/dj/profiel",
      icon: User,
      isActive: (p) => p.startsWith("/dashboard/dj/profiel"),
    },
    {
      key: "media",
      label: "Media & Links",
      href: "/dashboard/dj/media",
      icon: ImageIcon,
      isActive: (p) => p.startsWith("/dashboard/dj/media"),
    },
    {
      key: "kalender",
      label: "Beschikbaarheid",
      href: "/dashboard/dj/beschikbaarheid",
      icon: CalendarDays,
      isActive: (p) =>
        p.startsWith("/dashboard/dj/beschikbaarheid") ||
        p.startsWith("/dashboard/dj/kalender"),
    },
    {
      key: "uitbetalingen",
      label: "Uitbetalingen",
      href: "/dashboard/dj/uitbetalingen",
      icon: Wallet,
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
    await supabase.auth.signOut();
    router.replace("/auth");
    router.refresh();
  }, [router]);

  const navItems = sidebarRole === "dj" ? djNav() : klantNav();

  const renderDesktopNavLinks = () =>
    navItems.map((item) => {
      const active = item.isActive(pathname);
      return (
        <Link
          key={item.key}
          href={item.href}
          className={`relative flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 md:border-l-[3px] ${
            active
              ? "border-bookadj bg-bookadj/15 text-ink shadow-sm md:border-bookadj md:bg-bookadj/10"
              : "text-ink-secondary hover:bg-surface-muted/80 md:border-transparent"
          }`}
        >
          <span className="min-w-0 flex-1">{item.label}</span>
          {item.unreadBadge && unreadMessages > 0 ? (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-caution px-1.5 text-[10px] font-bold text-white md:bg-caution">
              {unreadMessages > 9 ? "9+" : unreadMessages}
            </span>
          ) : null}
        </Link>
      );
    });

  if (!ready || !userEmail) {
    return (
      <div className="min-h-screen bg-app font-sans text-ink">
        <Navbar />
        <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
          <DashboardShellSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app pb-[4.5rem] font-sans text-ink md:pb-0">
      <Navbar />

      <div className="mx-auto flex max-w-[1600px] flex-col md:flex-row">
        <aside
          className="hidden w-56 shrink-0 border-b-0 border-r border-line bg-surface md:block lg:w-60"
          aria-label={
            sidebarRole === "dj" ? "DJ-dashboard navigatie" : "Dashboard navigatie"
          }
        >
          <nav className="flex flex-col gap-0.5 p-4">
            {renderDesktopNavLinks()}
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="mt-3 border-t border-line pt-4 text-left text-sm font-medium text-ink-secondary transition-colors hover:text-ink disabled:opacity-50"
            >
              Uitloggen
            </button>
          </nav>
        </aside>

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

      <nav
        className="fixed bottom-0 left-0 right-0 z-[60] flex items-stretch justify-around border-t border-line bg-surface px-1 pt-1 shadow-[0_-4px_24px_rgba(0,0,0,0.35)] md:hidden"
        style={{
          paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))",
        }}
        aria-label={
          sidebarRole === "dj"
            ? "DJ-dashboard, snelle navigatie"
            : "Dashboard, snelle navigatie"
        }
      >
        {navItems.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`relative flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium transition-all duration-200 ${
                active ? "text-bookadj" : "text-ink-muted"
              }`}
            >
              <span className="relative">
                <Icon
                  className={`h-6 w-6 ${active ? "text-bookadj" : "text-ink-secondary"}`}
                  strokeWidth={1.75}
                  aria-hidden
                />
                {item.unreadBadge && unreadMessages > 0 ? (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-caution px-0.5 text-[9px] font-bold text-white">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                ) : null}
              </span>
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
