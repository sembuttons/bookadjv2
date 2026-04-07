"use client";

import { DashboardAppShell } from "@/components/dashboard-app-shell";

export function BerichtenLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAppShell expectedRole="auto" defaultContentPadding={false}>
      <div className="min-w-0">
        <div className="bg-gray-50 px-4 pb-4 pt-6 sm:px-6 lg:px-10 lg:pt-10">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Berichten
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Veilige berichten binnen bookadj — deel geen telefoonnummers of
            betaalverzoeken.
          </p>
        </div>
        <div className="px-4 py-6 pb-24 sm:px-6 md:pb-6 lg:px-10 lg:py-8">
          {children}
        </div>
      </div>
    </DashboardAppShell>
  );
}
