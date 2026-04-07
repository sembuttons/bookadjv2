"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PhotoLightbox } from "@/components/PhotoLightbox";

function initialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "");
  return parts.join("") || "?";
}

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
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [mobileActive, setMobileActive] = useState(0);

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const prev = () => setIndex((i) => (i - 1 + list.length) % list.length);
  const next = () => setIndex((i) => (i + 1) % list.length);

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
      className={`relative overflow-hidden rounded-2xl bg-gray-100 cursor-pointer transition duration-200 hover:brightness-90 ${className}`}
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

  // Mobile horizontal scroll indicator
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const children = Array.from(el.children) as HTMLElement[];
      if (!children.length) return;
      const left = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < children.length; i++) {
        const c = children[i];
        const mid = c.offsetLeft + c.clientWidth / 2;
        const d = Math.abs(mid - left);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      setMobileActive(best);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [list.length]);

  const showAllButton = list.length >= 4;
  const initials = useMemo(() => initialsFromName(name), [name]);

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="md:hidden">
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {list.length > 0 ? (
            list.map((_, i) => (
              <div
                key={list[i]}
                className="flex-none w-[85vw] aspect-[4/3] rounded-2xl overflow-hidden snap-center"
              >
                <Card i={i} className="h-full w-full" alt={`${name} — foto ${i + 1}`} />
              </div>
            ))
          ) : (
            <div className="flex-none w-[85vw] aspect-[4/3] rounded-2xl overflow-hidden snap-center bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-6xl font-black text-white/20">{initials}</span>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5" aria-hidden>
          {(list.length > 0 ? list : ["_"]).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === mobileActive
                  ? "bg-green-500 w-4"
                  : "bg-gray-300 w-2"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop/tablet: Airbnb-style grid */}
      <div className="hidden md:block">
        {list.length === 0 ? null : list.length === 1 ? (
          <div className="relative">
            <Card i={0} className="aspect-video w-full" alt={`${name} — foto`} />
          </div>
        ) : list.length === 2 ? (
          <div className="grid grid-cols-2 gap-2">
            <Card i={0} className="aspect-video w-full" alt={`${name} — foto 1`} />
            <Card i={1} className="aspect-video w-full" alt={`${name} — foto 2`} />
          </div>
        ) : (
          <div className="relative grid grid-cols-5 gap-2">
            {/* Left large (60%) */}
            <div className="col-span-3">
              <Card
                i={0}
                className="h-full min-h-[320px] lg:min-h-[380px] xl:min-h-[420px]"
                alt={`${name} — foto 1`}
              />
            </div>

            {/* Right stacked (40%) */}
            <div className="col-span-2 grid grid-rows-2 gap-2">
              <Card i={1} className="h-full" alt={`${name} — foto 2`} />
              <Card i={2} className="h-full" alt={`${name} — foto 3`} />
            </div>

            {videoAnchorHref ? (
              <a
                href={videoAnchorHref}
                className="absolute right-3 top-3 inline-flex items-center justify-center rounded-xl bg-black/45 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-black/55"
              >
                Video
              </a>
            ) : null}

            {showAllButton ? (
              <button
                type="button"
                onClick={() => openAt(0)}
                className="absolute bottom-3 right-3 inline-flex items-center justify-center rounded-xl bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-gray-200 shadow-sm hover:bg-white"
              >
                Alle foto&apos;s bekijken
              </button>
            ) : null}
          </div>
        )}
      </div>

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

