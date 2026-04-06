"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function MobileStickyBookingBar({ djId }: { djId: string }) {
  const [panelInView, setPanelInView] = useState(false);

  useEffect(() => {
    const el = document.getElementById("booking-panel-anchor");
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        setPanelInView(Boolean(e?.isIntersecting));
      },
      { root: null, threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const boekenHref = useMemo(
    () => `/boeken/${encodeURIComponent(djId)}`,
    [djId],
  );

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[70] border-t border-gray-800 bg-[#111827]/95 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-transform duration-200 lg:hidden ${
        panelInView ? "translate-y-full" : "translate-y-0"
      }`}
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
      }}
      aria-hidden={panelInView}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3">
        <p className="min-w-0 flex-1 text-sm font-semibold text-white">
          Klaar om te boeken?
        </p>
        <Link
          href={boekenHref}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-green-500 px-6 text-sm font-bold text-black transition-all duration-200 hover:bg-green-400"
        >
          Boek nu
        </Link>
      </div>
    </div>
  );
}

