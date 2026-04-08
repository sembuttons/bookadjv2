"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

export function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node | null;
      if (t && rootRef.current?.contains(t)) return;
      setShow(false);
    };
    document.addEventListener("click", handleClickOutside, true);
    return () =>
      document.removeEventListener("click", handleClickOutside, true);
  }, [show]);

  return (
    <div
      ref={rootRef}
      className="relative ml-1.5 inline-flex items-center"
    >
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onClick={(e) => {
          e.stopPropagation();
          setShow((v) => !v);
        }}
        className="text-gray-400 transition-colors hover:text-gray-600"
        aria-label="Meer informatie"
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </button>

      {show ? (
        <div
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl bg-gray-900 px-3 py-2.5 text-xs leading-relaxed text-white shadow-lg"
          role="tooltip"
        >
          {text}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      ) : null}
    </div>
  );
}
