"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getCity,
  getGenres,
  getStageName,
  type DjProfileRow,
} from "@/lib/dj-profile-helpers";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80&auto=format&fit=crop";

function initials(name: string) {
  const s = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return s || "DJ";
}

export function RelatedDjsCarousel({ djs }: { djs: DjProfileRow[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth * 0.85;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  }, []);

  if (djs.length === 0) return null;

  return (
    <section
      className="mt-16 pt-12"
      aria-labelledby="related-djs-heading"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id="related-djs-heading"
          className="text-xl font-bold text-slate-900 sm:text-2xl"
        >
          Andere DJ&apos;s die je misschien leuk vindt
        </h2>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:border-green-200 hover:bg-green-50"
            aria-label="Vorige DJ’s"
            onClick={() => scrollByDir(-1)}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:border-green-200 hover:bg-green-50"
            aria-label="Volgende DJ’s"
            onClick={() => scrollByDir(1)}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 pt-1 snap-x snap-mandatory scrollbar-thin md:mx-0 md:px-0"
        style={{ scrollbarWidth: "thin" }}
      >
        {djs.map((row) => {
          const id = String(row.id);
          const name = getStageName(row);
          const city = getCity(row);
          const genres = getGenres(row).slice(0, 3);
          return (
            <Link
              key={id}
              href={`/dj/${encodeURIComponent(id)}`}
              className="group card-interactive flex w-[min(100%,280px)] shrink-0 snap-start flex-col overflow-hidden md:w-[260px]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                <img
                  src={FALLBACK_IMG}
                  alt=""
                  className="h-full w-full object-cover opacity-90 transition-transform duration-200 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-bold text-slate-700 shadow-sm">
                    {initials(name)}
                  </span>
                  <span className="min-w-0 truncate text-sm font-bold text-white drop-shadow">
                    {name}
                  </span>
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-sm text-slate-500">{city}</p>
                <div className="flex flex-wrap gap-1.5">
                  {genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <p className="mt-auto pt-2 text-sm font-medium text-green-600">
                  Bekijk profiel
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
