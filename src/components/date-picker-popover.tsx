"use client";

import { useEffect, useRef, useState } from "react";

const MONTHS_NL = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
] as const;

const WEEKDAYS_NL = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"] as const;

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export function toISODateLocal(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseISODate(iso: string): Date | null {
  if (!iso.trim()) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : startOfDay(dt);
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M12.5 15L7.5 10L12.5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M7.5 15L12.5 10L7.5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type DatePickerPopoverProps = {
  value: string;
  onChange: (isoDate: string) => void;
  label?: string;
  placeholder?: string;
  hiddenInputName?: string;
  triggerClassName?: string;
  popoverAlign?: "left" | "right";
  triggerId?: string;
};

export function DatePickerPopover({
  value,
  onChange,
  label = "Datum",
  placeholder = "Kies een datum",
  hiddenInputName,
  triggerClassName,
  popoverAlign = "left",
  triggerId,
}: DatePickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const selected = parseISODate(value);
  const [cursor, setCursor] = useState(() => {
    const t = selected ?? new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const s = parseISODate(value);
    if (s) {
      setCursor(new Date(s.getFullYear(), s.getMonth(), 1));
    }
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

  const today = startOfDay(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < mondayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function isToday(day: number) {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  }

  function isSelected(day: number) {
    if (!selected) return false;
    return (
      day === selected.getDate() &&
      month === selected.getMonth() &&
      year === selected.getFullYear()
    );
  }

  function selectDay(day: number) {
    const d = new Date(year, month, day);
    onChange(toISODateLocal(startOfDay(d)));
    setOpen(false);
  }

  const labelText = selected
    ? `${pad2(selected.getDate())}/${pad2(selected.getMonth() + 1)}/${selected.getFullYear()}`
    : null;

  const popAlign =
    popoverAlign === "right" ? "right-0 left-auto" : "left-0";

  return (
    <div className="relative flex flex-col gap-1.5 text-left">
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
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
          "input-field flex items-center justify-start text-left"
        }
      >
        <span className={labelText ? "" : "text-neutral-400"}>
          {labelText ?? placeholder}
        </span>
      </button>
      {hiddenInputName ? (
        <input type="hidden" name={hiddenInputName} value={value} />
      ) : null}

      {open ? (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Kalender"
          className={`absolute top-full z-[60] mt-2 w-[min(100vw-2rem,320px)] rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl ring-1 ring-black/5 ${popAlign}`}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100"
              aria-label="Vorige maand"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <p className="min-w-0 flex-1 text-center text-sm font-semibold capitalize text-neutral-900">
              {MONTHS_NL[month]} {year}
            </p>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100"
              aria-label="Volgende maand"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            {WEEKDAYS_NL.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) =>
              day == null ? (
                <div key={`e-${i}`} className="aspect-square" />
              ) : (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={[
                    "flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition-colors",
                    isSelected(day)
                      ? "bg-bookadj text-white shadow-sm"
                      : isToday(day)
                        ? "bg-neutral-100 font-semibold text-neutral-900 ring-1 ring-neutral-300"
                        : "text-neutral-800 hover:bg-neutral-50",
                  ].join(" ")}
                >
                  {day}
                </button>
              ),
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
