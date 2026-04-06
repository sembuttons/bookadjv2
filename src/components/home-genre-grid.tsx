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
                  ? "border-bookadj bg-bookadj text-white ring-2 ring-bookadj/35"
                  : "border-bookadj/25 bg-white text-neutral-900 hover:border-bookadj/60 active:border-bookadj active:bg-bookadj active:text-white",
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
