"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Calendar, MessageCircle, User, Star, Image as ImageIcon } from "lucide-react";

type Tab = {
  label: string;
  icon: LucideIcon;
  href: string;
  isActive?: (pathname: string) => boolean;
};

const klantTabs: Tab[] = [
  { label: "Boekingen", icon: Calendar, href: "/dashboard/klant" },
  {
    label: "Berichten",
    icon: MessageCircle,
    href: "/berichten",
    isActive: (p) => p === "/berichten" || p.startsWith("/berichten/"),
  },
  { label: "Reviews", icon: Star, href: "/dashboard/klant/reviews" },
  { label: "Profiel", icon: User, href: "/dashboard/klant/profiel" },
];

const djTabs: Tab[] = [
  { label: "Boekingen", icon: Calendar, href: "/dashboard/dj" },
  {
    label: "Berichten",
    icon: MessageCircle,
    href: "/berichten",
    isActive: (p) => p === "/berichten" || p.startsWith("/berichten/"),
  },
  { label: "Profiel", icon: User, href: "/dashboard/dj/profiel" },
  { label: "Media", icon: ImageIcon, href: "/dashboard/dj/media" },
];

export function BottomNav({ variant }: { variant: "klant" | "dj" }) {
  const pathname = usePathname();
  const tabs = variant === "dj" ? djTabs : klantTabs;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 grid grid-cols-4 z-50 lg:hidden"
      style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom, 0px))" }}
      aria-label="Dashboard navigatie"
    >
      {tabs.map((t) => {
        const active = t.isActive ? t.isActive(pathname) : pathname === t.href;
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-col items-center justify-center py-2 gap-1 min-h-[64px] ${
              active ? "text-green-600" : "text-gray-400"
            }`}
          >
            <Icon className="w-5 h-5" aria-hidden />
            <span className="text-[10px] font-medium">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

