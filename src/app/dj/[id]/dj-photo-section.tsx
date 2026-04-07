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

export function DjPhotoSection({
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
      <div
        className="w-full mt-6 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"
        style={{ height: "360px" }}
      >
        <span className="text-9xl font-black text-white/10">
          {initialsFromName(name)}
        </span>
      </div>
    );
  }

  const photo0 = list[0];
  const photo1 = list[1] || list[0];
  const photo2 = list[2] || list[0];

  return (
    <div className="w-full mt-6">
      {/* Desktop grid */}
      <div
        className="hidden md:block relative rounded-2xl overflow-hidden"
        style={{ height: "500px" }}
      >
        {list.length === 1 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo0}
              alt="DJ foto 1"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => openLightbox(0)}
            />
            <button
              type="button"
              onClick={() => openLightbox(0)}
              className="absolute bottom-4 right-4 bg-white text-gray-900 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 shadow-md hover:bg-gray-50 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              Foto bekijken
            </button>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2 h-full">
            {/* Left: 1 large photo */}
            <div className="overflow-hidden rounded-l-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo0}
                alt="DJ foto 1"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                onClick={() => openLightbox(0)}
              />
            </div>

            {/* Right: 2 stacked photos */}
            <div className="grid grid-rows-2 gap-2">
              <div className="overflow-hidden rounded-tr-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo1}
                  alt="DJ foto 2"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => openLightbox(1)}
                />
              </div>
              <div className="overflow-hidden rounded-br-2xl relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo2}
                  alt="DJ foto 3"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => openLightbox(2)}
                />

                {/* "Alle foto's bekijken" button - bottom right */}
                {list.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => openLightbox(0)}
                    className="absolute bottom-4 right-4 bg-white text-gray-900 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    Alle foto&apos;s bekijken
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile horizontal scroll */}
      <div className="flex md:hidden gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2">
        {list.map((photo: string, i: number) => (
          <div
            key={i}
            className="flex-none w-[80vw] rounded-2xl overflow-hidden snap-center"
            style={{ height: "240px" }}
            onClick={() => openLightbox(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={`Foto ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Lightbox modal */}
      {lightboxOpen ? (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            aria-label="Sluiten"
          >
            <X className="w-6 h-6" aria-hidden />
          </button>

          {/* Photo counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
            {lightboxIndex + 1} / {list.length}
          </div>

          {/* Previous button */}
          {lightboxIndex > 0 ? (
            <button
              type="button"
              className="absolute left-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => i - 1);
              }}
              aria-label="Vorige foto"
            >
              <ChevronLeft className="w-6 h-6" aria-hidden />
            </button>
          ) : null}

          {/* Main image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={list[lightboxIndex]}
            alt={`Foto ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next button */}
          {lightboxIndex < list.length - 1 ? (
            <button
              type="button"
              className="absolute right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => i + 1);
              }}
              aria-label="Volgende foto"
            >
              <ChevronRight className="w-6 h-6" aria-hidden />
            </button>
          ) : null}

          {/* Thumbnail strip at bottom */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto">
            {list.map((photo: string, i: number) => (
              <div
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(i);
                }}
                className={`flex-none w-16 h-12 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  i === lightboxIndex
                    ? "ring-2 ring-white opacity-100"
                    : "opacity-50 hover:opacity-75"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

