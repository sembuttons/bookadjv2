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
                "flex h-28 items-center justify-center rounded-xl border-2 text-lg font-semibold shadow-sm transition-all hover:-translate-y-0.5",
                isActive
                  ? "border-black bg-black text-white"
                  : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-900 active:border-black active:bg-black active:text-white",
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
