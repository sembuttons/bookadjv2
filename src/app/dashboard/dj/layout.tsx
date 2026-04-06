"use client";

import { DashboardAppShell } from "@/components/dashboard-app-shell";

export default function DjDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardAppShell expectedRole="dj">{children}</DashboardAppShell>;
}
