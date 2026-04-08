"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

function initialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "");
  return parts.join("") || "?";
}

export function DjInstagramPhotoGrid({
  photos,
  name,
}: {
  photos: string[];
  name: string;
}) {
  const list = useMemo(() => (photos ?? []).filter(Boolean), [photos]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight" && lightboxIndex < list.length - 1) {
        setLightboxIndex((i) => i + 1);
      }
      if (e.key === "ArrowLeft" && lightboxIndex > 0) {
        setLightboxIndex((i) => i - 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, lightboxIndex, list.length]);

  if (!list.length) {
    return (
      <section aria-label="Foto's">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Foto&apos;s</h2>
        <div className="mt-4 grid grid-cols-3 gap-0.5 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <div className="col-span-3 aspect-square flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-6xl font-black text-gray-300">
              {initialsFromName(name)}
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Foto's">
      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Foto&apos;s</h2>
      <div className="mt-4 grid grid-cols-3 gap-0.5">
        {list.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            className="relative aspect-square w-full overflow-hidden bg-gray-100 p-0"
            onClick={() => openLightbox(i)}
            aria-label={`Foto ${i + 1} vergroten`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="h-full w-full cursor-pointer object-cover transition-opacity hover:opacity-95"
            />
          </button>
        ))}
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setLightboxOpen(false)}
          role="presentation"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            aria-label="Sluiten"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>

          <div className="absolute left-1/2 top-4 -translate-x-1/2 text-sm font-medium text-white/70">
            {lightboxIndex + 1} / {list.length}
          </div>

          {lightboxIndex > 0 ? (
            <button
              type="button"
              className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => i - 1);
              }}
              aria-label="Vorige foto"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden />
            </button>
          ) : null}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={list[lightboxIndex]}
            alt={`Foto ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxIndex < list.length - 1 ? (
            <button
              type="button"
              className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => i + 1);
              }}
              aria-label="Volgende foto"
            >
              <ChevronRight className="h-6 w-6" aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
