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
      className={`relative bg-gray-100 cursor-pointer transition duration-200 hover:brightness-90 ${className}`}
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
                className="flex-none w-[80vw] h-[240px] rounded-2xl overflow-hidden snap-center"
              >
                <Card
                  i={i}
                  className="h-full w-full rounded-2xl overflow-hidden"
                  alt={`${name} — foto ${i + 1}`}
                />
              </div>
            ))
          ) : (
            <div className="flex-none w-[80vw] h-[240px] rounded-2xl overflow-hidden snap-center bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-6xl font-black text-white/20">
                {initials}
              </span>
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
          <div className="w-full h-[480px] rounded-2xl overflow-hidden">
            <Card i={0} className="h-full w-full" alt={`${name} — foto`} />
          </div>
        ) : list.length === 2 ? (
          <div className="grid grid-cols-2 gap-2 h-[480px] rounded-2xl overflow-hidden">
            <Card i={0} className="h-full w-full" alt={`${name} — foto 1`} />
            <Card i={1} className="h-full w-full" alt={`${name} — foto 2`} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 h-[480px]">
            {/* Left: 1 large photo */}
            <div className="rounded-l-2xl overflow-hidden">
              <Card i={0} className="h-full w-full" alt={`${name} — foto 1`} />
            </div>

            {/* Right: 2 stacked photos */}
            <div className="grid grid-rows-2 gap-2">
              <div className="rounded-tr-2xl overflow-hidden">
                <Card i={1} className="h-full w-full" alt={`${name} — foto 2`} />
              </div>
              <div className="rounded-br-2xl overflow-hidden relative">
                <Card i={2} className="h-full w-full" alt={`${name} — foto 3`} />
                {list.length > 3 ? (
                  <button
                    type="button"
                    onClick={() => openAt(0)}
                    className="absolute bottom-3 right-3 bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    +{list.length - 3} foto&apos;s
                  </button>
                ) : null}
              </div>
            </div>
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

