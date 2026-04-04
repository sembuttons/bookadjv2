"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const sidebarLinks = [
  { href: "/dashboard/dj", label: "Aanvragen", match: "exact" as const },
  {
    href: "/dashboard/dj/bevestigd",
    label: "Bevestigd",
    match: "prefix" as const,
  },
  {
    href: "/dashboard/dj/kalender",
    label: "Kalender",
    match: "prefix" as const,
  },
  {
    href: "/dashboard/dj/berichten",
    label: "Berichten",
    match: "prefix" as const,
  },
  {
    href: "/dashboard/dj/profiel",
    label: "Mijn profiel",
    match: "prefix" as const,
  },
  {
    href: "/dashboard/dj/uitbetalingen",
    label: "Uitbetalingen",
    match: "prefix" as const,
  },
];

function linkIsActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DjDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

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
      if (role !== "dj") {
        router.replace("/dashboard/klant");
        return;
      }

      setUserEmail(session.user.email ?? null);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/auth");
    router.refresh();
  }, [router]);

  if (!ready || !userEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 font-sans">
        <p className="text-lg font-semibold text-neutral-900">Laden…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white shadow-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 text-xl font-semibold tracking-tight text-white"
          >
            bookadj
          </Link>
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span
              className="hidden truncate text-sm text-white/80 sm:block"
              title={userEmail}
            >
              {userEmail}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="shrink-0 rounded-lg border border-white/25 bg-transparent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              {loggingOut ? "Bezig…" : "Uitloggen"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col md:flex-row">
        <aside className="border-b border-neutral-200 bg-neutral-50 md:w-56 md:shrink-0 md:border-b-0 md:border-r md:border-neutral-200 md:bg-white lg:w-60">
          <nav
            className="flex flex-wrap gap-1 p-3 md:flex-col md:gap-0 md:p-4"
            aria-label="DJ-dashboard navigatie"
          >
            {sidebarLinks.map((item) => {
              const active = linkIsActive(pathname, item.href, item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors md:px-3 md:py-2.5 ${
                    active
                      ? "bg-black text-white md:bg-neutral-100 md:text-neutral-900"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50 md:mt-2 md:border-t md:border-neutral-200 md:pt-4"
            >
              Uitloggen
            </button>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
