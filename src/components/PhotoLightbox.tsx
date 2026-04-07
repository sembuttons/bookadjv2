"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

export function PhotoLightbox({
  open,
  urls,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  open: boolean;
  urls: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrev, open]);

  if (!open) return null;
  const src = urls[index] ?? "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Foto bekijken"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/15"
          aria-label="Sluiten"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        <div className="relative overflow-hidden rounded-2xl bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="max-h-[80vh] w-full object-contain"
          />
        </div>

        {urls.length > 1 ? (
          <>
            <button
              type="button"
              onClick={onPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/15"
              aria-label="Vorige foto"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/15"
              aria-label="Volgende foto"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

