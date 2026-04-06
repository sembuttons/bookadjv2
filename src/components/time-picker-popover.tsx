"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STEP_MIN = 15;

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export function formatHHMM(h: number, m: number) {
  return `${pad2(h)}:${pad2(m)}`;
}

function parseHHMM(s: string): { h: number; m: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isInteger(h) || !Number.isInteger(min)) return null;
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return { h, m: min };
}

const SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += STEP_MIN) {
      out.push(formatHHMM(h, m));
    }
  }
  return out;
})();

export type TimePickerPopoverProps = {
  value: string;
  onChange: (hhmm: string) => void;
  label?: string;
  placeholder?: string;
  triggerClassName?: string;
  popoverAlign?: "left" | "right";
  triggerId?: string;
};

export function TimePickerPopover({
  value,
  onChange,
  label = "Starttijd",
  placeholder = "Kies een tijd",
  triggerClassName,
  popoverAlign = "left",
  triggerId,
}: TimePickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const display = useMemo(() => {
    const p = parseHHMM(value);
    return p ? formatHHMM(p.h, p.m) : null;
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const node = e.target as Node;
      if (popoverRef.current?.contains(node)) return;
      if (triggerRef.current?.contains(node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const popAlign =
    popoverAlign === "right" ? "right-0 left-auto" : "left-0";

  return (
    <div className="relative flex flex-col gap-1.5 text-left">
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </span>
      ) : null}
      <button
        type="button"
        ref={triggerRef}
        id={triggerId}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={
          triggerClassName ??
          "flex h-[42px] w-full items-center rounded-lg border border-gray-800 bg-[#111827] px-3 py-2.5 text-left text-sm text-white outline-none ring-black transition-[box-shadow] focus:border-green-800 focus:ring-2"
        }
      >
        <span className={display ? "" : "text-gray-500"}>
          {display ?? placeholder}
        </span>
      </button>

      {open ? (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Tijd kiezen"
          className={`absolute top-full z-[60] mt-2 max-h-64 w-[min(100vw-2rem,200px)] overflow-y-auto rounded-2xl border border-gray-800 bg-[#111827] p-2 shadow-2xl ring-1 ring-gray-800/30 ${popAlign}`}
        >
          <div className="grid grid-cols-1 gap-0.5">
            {SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => {
                  onChange(slot);
                  setOpen(false);
                }}
                className={[
                  "rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                  value === slot
                    ? "bg-green-500 text-black font-bold"
                    : "text-white hover:bg-[#0f172a]",
                ].join(" ")}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
