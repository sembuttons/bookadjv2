"use client";

import { DashboardAppShell } from "@/components/dashboard-app-shell";

export function BerichtenLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAppShell expectedRole="auto" defaultContentPadding={false}>
      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden md:h-[calc(100vh-64px)]">
        <div className="shrink-0 bg-gray-50 px-4 pb-4 pt-6 sm:px-6 lg:px-10 lg:pt-10">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Berichten
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Veilige berichten binnen bookadj. Deel geen telefoonnummers of
            betaalverzoeken.
          </p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-24 pt-4 sm:px-6 md:pb-4 lg:px-10 lg:pt-6">
          {children}
        </div>
      </div>
    </DashboardAppShell>
  );
}
