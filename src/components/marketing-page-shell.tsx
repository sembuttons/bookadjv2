import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

type Max = "narrow" | "medium" | "wide" | "prose";

const maxClass: Record<Max, string> = {
  narrow: "max-w-2xl",
  medium: "max-w-3xl",
  wide: "max-w-4xl",
  prose: "max-w-3xl lg:max-w-[48rem]",
};

export function MarketingPageShell({
  children,
  maxWidth = "medium",
}: {
  children: ReactNode;
  maxWidth?: Max;
}) {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <Navbar />
      <main
        className={`mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:px-8 ${maxClass[maxWidth]}`}
      >
        {children}
      </main>
    </div>
  );
}
