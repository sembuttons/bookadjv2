"use client";

import Link from "next/link";
import { useState } from "react";

export function HomeGenreGrid({ genres }: { genres: readonly string[] }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {genres.map((g) => {
        const isActive = activeSlug === g;
        return (
          <li key={g}>
            <Link
              href={`/zoeken?genre=${encodeURIComponent(g)}`}
              onClick={() => setActiveSlug(g)}
              className={[
                "flex h-28 items-center justify-center rounded-xl border-2 text-lg font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
                isActive
                  ? "border-green-500 bg-green-500 text-black font-bold ring-2 ring-green-500/35"
                  : "border-green-500/25 bg-[#111827] text-white hover:border-green-500/60 active:border-green-500 active:bg-green-500 active:text-black",
              ].join(" ")}
            >
              {g}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
