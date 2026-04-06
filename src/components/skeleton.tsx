import type { ReactNode } from "react";

export function Skeleton({
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200/80 ${className}`}
      {...rest}
    />
  );
}

export function ZoekenResultsSkeleton() {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i}>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <Skeleton className="aspect-[4/3] w-full rounded-none rounded-t-2xl" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DashboardBookingsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="space-y-4" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <li key={i}>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full max-w-md" />
                <Skeleton className="h-4 w-full max-w-sm" />
              </div>
              <div className="space-y-2 sm:w-40">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DashboardShellSkeleton() {
  return (
    <div className="flex min-h-[50vh] flex-col gap-6 md:flex-row" aria-hidden>
      <div className="hidden w-56 shrink-0 space-y-2 border-r border-gray-100 pr-4 md:block">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <div className="min-w-0 flex-1 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <DashboardBookingsSkeleton rows={2} />
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-[#f0fdf4]/50 px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-green-100 text-green-600 ring-1 ring-green-100">
        {icon}
      </div>
      <h2 className="mt-5 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
