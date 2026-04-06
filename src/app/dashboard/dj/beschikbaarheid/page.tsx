"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { toISODateLocal } from "@/components/date-picker-popover";

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

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
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

export default function DjBeschikbaarheidPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [djProfileId, setDjProfileId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [pendingIso, setPendingIso] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() =>
    startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setError("Geen sessie.");
      setLoading(false);
      return;
    }

    const { data: profile, error: pe } = await supabase
      .from("dj_profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (pe) {
      setError(pe.message);
      setLoading(false);
      return;
    }
    if (!profile?.id) {
      setDjProfileId(null);
      setBlocked(new Set());
      setLoading(false);
      return;
    }

    const id = profile.id as string;
    setDjProfileId(id);

    const { data: rows, error: ae } = await supabase
      .from("dj_availability")
      .select("blocked_date")
      .eq("dj_id", id);

    if (ae) {
      setError(ae.message);
      setLoading(false);
      return;
    }

    const next = new Set<string>();
    for (const r of rows ?? []) {
      const d = (r as { blocked_date?: string }).blocked_date;
      if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) next.add(d);
    }
    setBlocked(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = startOfDay(new Date());

  const cells: (number | null)[] = [];
  for (let i = 0; i < mondayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const toggleDate = useCallback(
    async (day: number) => {
      if (!djProfileId) return;
      const d = startOfDay(new Date(year, month, day));
      if (d < today) return;
      const iso = toISODateLocal(d);
      setPendingIso(iso);
      setError(null);

      const isBlocked = blocked.has(iso);
      if (isBlocked) {
        const { error: delErr } = await supabase
          .from("dj_availability")
          .delete()
          .eq("dj_id", djProfileId)
          .eq("blocked_date", iso);
        setPendingIso(null);
        if (delErr) {
          setError(delErr.message);
          return;
        }
        setBlocked((prev) => {
          const n = new Set(prev);
          n.delete(iso);
          return n;
        });
        return;
      }

      const { error: insErr } = await supabase.from("dj_availability").insert({
        dj_id: djProfileId,
        blocked_date: iso,
      });
      setPendingIso(null);
      if (insErr) {
        setError(insErr.message);
        return;
      }
      setBlocked((prev) => new Set(prev).add(iso));
    },
    [blocked, djProfileId, month, year, today],
  );

  const legend = useMemo(
    () => (
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-neutral-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-emerald-100 ring-1 ring-emerald-200" />
          Beschikbaar
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-red-100 ring-1 ring-red-200" />
          Niet beschikbaar
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-neutral-100 ring-1 ring-neutral-200" />
          Verleden
        </span>
      </div>
    ),
    [],
  );

  if (loading) {
    return (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Beschikbaarheid
        </h1>
        <p className="mt-2 text-sm text-neutral-600">Kalender laden…</p>
      </>
    );
  }

  if (!djProfileId) {
    return (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Beschikbaarheid
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Je hebt nog geen DJ-profiel. Maak eerst een profiel aan om data te blokkeren.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
        Beschikbaarheid
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Tik op een dag om deze als niet beschikbaar te markeren. Boekers kunnen die datum niet meer
        kiezen. Tik opnieuw om de blokkering op te heffen.
      </p>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="mt-8 max-w-lg rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100"
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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100"
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
          {cells.map((day, i) => {
            if (day == null) {
              return <div key={`e-${i}`} className="aspect-square" />;
            }
            const cellDate = startOfDay(new Date(year, month, day));
            const iso = toISODateLocal(cellDate);
            const isPast = cellDate < today;
            const isBlocked = blocked.has(iso);
            const isWorking = pendingIso === iso;
            return (
              <button
                key={`${year}-${month}-${day}`}
                type="button"
                disabled={isPast || isWorking}
                onClick={() => void toggleDate(day)}
                className={[
                  "flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition-colors",
                  isPast
                    ? "cursor-not-allowed bg-neutral-50 text-neutral-300"
                    : isBlocked
                      ? "bg-red-100 font-semibold text-red-900 ring-1 ring-red-200 hover:bg-red-200/80"
                      : "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100 hover:bg-emerald-100",
                ].join(" ")}
              >
                {isWorking ? "…" : day}
              </button>
            );
          })}
        </div>
        {legend}
      </div>
    </>
  );
}
