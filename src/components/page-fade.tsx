"use client";

import type { ReactNode } from "react";

/**
 * Wraps route segment content; pair with app/template.tsx + key={pathname} to re-run on navigation.
 */
export function PageFade({ children }: { children: ReactNode }) {
  return (
    <div className="animate-page-enter flex min-h-0 min-w-0 flex-1 flex-col">
      {children}
    </div>
  );
}
