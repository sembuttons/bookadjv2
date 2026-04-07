"use client";

import { useMemo, useState } from "react";
import { PhotoLightbox } from "@/components/PhotoLightbox";

export function DjPhotoGrid({
  urls,
  name,
  videoAnchorHref,
}: {
  urls: string[];
  name: string;
  videoAnchorHref?: string | null;
}) {
  const list = useMemo(() => urls.filter(Boolean), [urls]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const prev = () => setIndex((i) => (i - 1 + list.length) % list.length);
  const next = () => setIndex((i) => (i + 1) % list.length);

  if (list.length === 0) return null;

  const Card = ({
    i,
    className,
    alt,
  }: {
    i: number;
    className: string;
    alt: string;
  }) => (
    <button
      type="button"
      onClick={() => openAt(i)}
      className={`relative overflow-hidden rounded-2xl bg-gray-100 ${className}`}
      aria-label="Open foto"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={list[i]}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </button>
  );

  return (
    <>
      {list.length === 1 ? (
        <div className="relative">
          <Card
            i={0}
            className="aspect-video w-full"
            alt={`${name} — foto`}
          />
        </div>
      ) : list.length === 2 ? (
        <div className="grid grid-cols-2 gap-2 lg:gap-3">
          <Card i={0} className="aspect-[4/3]" alt={`${name} — foto 1`} />
          <Card i={1} className="aspect-[4/3]" alt={`${name} — foto 2`} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3">
          <div className="relative">
            <Card i={0} className="min-h-[220px] lg:min-h-[420px]" alt={`${name} — foto 1`} />
            {videoAnchorHref ? (
              <a
                href={videoAnchorHref}
                className="absolute right-3 top-3 inline-flex items-center justify-center rounded-xl bg-black/45 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-black/55"
              >
                Video
              </a>
            ) : null}
          </div>
          <div className="grid min-h-[220px] grid-rows-2 gap-2 lg:min-h-[420px]">
            <Card i={1} className="" alt={`${name} — foto 2`} />
            <Card i={2} className="" alt={`${name} — foto 3`} />
          </div>
        </div>
      )}

      <PhotoLightbox
        open={open}
        urls={list}
        index={index}
        onClose={() => setOpen(false)}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}

