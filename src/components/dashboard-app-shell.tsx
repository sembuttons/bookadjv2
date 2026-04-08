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
import { BottomNav } from "@/components/BottomNav";
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
      isActive: (p) =>
        p.startsWith("/dashboard/dj/profiel") ||
        p.startsWith("/dashboard/dj/profiel-bewerken"),
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

      // Ensure a public.users row exists before any other dashboard queries.
      const metaRole = session.user.user_metadata?.role;
      const roleForDb =
        typeof metaRole === "string" && metaRole.toLowerCase() === "dj"
          ? "dj"
          : "klant";
      await supabase.from("users").upsert(
        {
          id: session.user.id,
          email: session.user.email ?? null,
          role: roleForDb,
          full_name:
            (session.user.user_metadata?.full_name as string | undefined) ?? null,
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

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
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            active
              ? "bg-green-50 text-green-700 font-semibold border-l-4 border-green-500"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          }`}
        >
          <span className="min-w-0 flex-1">{item.label}</span>
          {item.unreadBadge && unreadMessages > 0 ? (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white md:bg-amber-500">
              {unreadMessages > 9 ? "9+" : unreadMessages}
            </span>
          ) : null}
        </Link>
      );
    });

  if (!ready || !userEmail) {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 antialiased">
        <Navbar />
        <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
          <DashboardShellSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-[4.5rem] font-sans text-slate-900 antialiased md:pb-0">
      <Navbar />

      <div className="mx-auto flex max-w-[1600px] flex-col md:flex-row">
        <aside
          className="hidden w-56 shrink-0 border-b-0 border-r border-gray-200 bg-white md:block lg:w-60"
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
              className="mt-3 pt-4 text-left text-sm font-medium text-slate-500 transition-colors hover:bg-gray-50 hover:text-slate-900 disabled:opacity-50"
            >
              Uitloggen
            </button>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 bg-gray-50">
          {defaultContentPadding ? (
            <div className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      <BottomNav variant={sidebarRole} />
    </div>
  );
}
