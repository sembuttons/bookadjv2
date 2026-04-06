"use client";

import { DashboardAppShell } from "@/components/dashboard-app-shell";

export default function KlantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAppShell expectedRole="klant">{children}</DashboardAppShell>
  );
}
