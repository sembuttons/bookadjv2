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
      className={`fixed bottom-0 left-0 right-0 z-[70] bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-transform duration-200 lg:hidden ${
        panelInView ? "translate-y-full" : "translate-y-0"
      }`}
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
      }}
      aria-hidden={panelInView}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3">
        <p className="min-w-0 flex-1 text-sm font-semibold text-slate-900">
          Klaar om te boeken?
        </p>
        <Link
          href={boekenHref}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-green-400 px-6 text-sm font-bold text-black transition-all duration-150 hover:from-green-400 hover:to-green-300 active:scale-[0.98]"
        >
          Boek nu
        </Link>
      </div>
    </div>
  );
}

