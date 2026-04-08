"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

const WEEKDAYS_NL = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"] as const;

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

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function toISODateLocal(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfToday() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

/** Monday = 0 … Sunday = 6 */
function weekdayMondayFirst(d: Date) {
  return (d.getDay() + 6) % 7;
}

export function MiniCalendar({ djProfileId }: { djProfileId: string | null }) {
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => startOfToday(), []);
  const view = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, []);

  useEffect(() => {
    if (!djProfileId) {
      setLoading(false);
      setBlocked(new Set());
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("dj_availability")
        .select("blocked_date")
        .eq("dj_id", djProfileId);
      if (cancelled) return;
      if (error) {
        setBlocked(new Set());
      } else {
        const rows = (data ?? []) as { blocked_date?: string }[];
        setBlocked(
          new Set(
            rows
              .map((r) => r.blocked_date)
              .filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)),
          ),
        );
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [djProfileId]);

  const { year, month } = view;
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = weekdayMondayFirst(first);
  const daysInMonth = last.getDate();

  const cells: { date: Date; iso: string }[] = [];
  for (let i = 0; i < startPad; i++) {
    cells.push({ date: new Date(0), iso: "" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({ date, iso: toISODateLocal(date) });
  }

  if (!djProfileId) {
    return (
      <p className="text-xs text-gray-500">
        Geen DJ-profiel gekoppeld aan dit gesprek.
      </p>
    );
  }

  if (loading) {
    return <p className="text-xs text-gray-400">Kalender laden…</p>;
  }

  return (
    <div>
      <p className="mb-2 text-center text-sm font-medium text-gray-800 capitalize">
        {MONTHS_NL[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-gray-500">
        {WEEKDAYS_NL.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          if (!c.iso) {
            return <div key={`e-${i}`} className="aspect-square" />;
          }
          const isPast = c.date.getTime() < today.getTime();
          const isBlocked = blocked.has(c.iso);
          let cls =
            "aspect-square flex items-center justify-center rounded-md text-xs font-medium ";
          if (isPast) {
            cls += "bg-gray-100 text-gray-400";
          } else if (isBlocked) {
            cls += "bg-red-100 text-red-800";
          } else {
            cls += "bg-green-100 text-green-800";
          }
          return (
            <div key={c.iso} className={cls} title={c.iso}>
              {c.date.getDate()}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-gray-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-100 ring-1 ring-green-200" />
          Beschikbaar
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-100 ring-1 ring-red-200" />
          Geblokkeerd
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gray-100 ring-1 ring-gray-200" />
          Verleden
        </span>
      </div>
    </div>
  );
}
