"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { toISODateLocal } from "@/components/date-picker-popover";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const WEEKDAYS_NL_UPPER = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"] as const;

function isIsoDate(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function DjBeschikbaarheidPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [djProfileId, setDjProfileId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [pendingIso, setPendingIso] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() =>
    startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2000);
  }, []);

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
      const d = (r as { blocked_date?: unknown }).blocked_date;
      if (isIsoDate(d)) next.add(d);
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
  const daysCount = daysInMonth(year, month);
  const today = startOfDay(new Date());

  const cells: (number | null)[] = [];
  for (let i = 0; i < mondayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysCount; d++) cells.push(d);

  const toggleDate = useCallback(
    async (day: number) => {
      if (!djProfileId) return;
      const d = startOfDay(new Date(year, month, day));
      if (d < today) return;
      const iso = toISODateLocal(d);
      setError(null);

      const wasBlocked = blocked.has(iso);
      // Optimistic UI update
      setBlocked((prev) => {
        const n = new Set(prev);
        if (wasBlocked) n.delete(iso);
        else n.add(iso);
        return n;
      });
      showToast(wasBlocked ? "Vrijgegeven" : "Geblokkeerd");

      setPendingIso(iso);
      if (wasBlocked) {
        const { error: delErr } = await supabase
          .from("dj_availability")
          .delete()
          .eq("dj_id", djProfileId)
          .eq("blocked_date", iso);
        setPendingIso(null);
        if (delErr) {
          // Rollback
          setBlocked((prev) => new Set(prev).add(iso));
          setError(delErr.message);
          showToast("Opslaan mislukt");
        }
        return;
      }

      const { error: insErr } = await supabase.from("dj_availability").insert({
        dj_id: djProfileId,
        blocked_date: iso,
      });
      setPendingIso(null);
      if (insErr) {
        // Rollback
        setBlocked((prev) => {
          const n = new Set(prev);
          n.delete(iso);
          return n;
        });
        setError(insErr.message);
        showToast("Opslaan mislukt");
      }
    },
    [blocked, djProfileId, month, showToast, today, year],
  );

  const monthStats = useMemo(() => {
    let blockedCount = 0;
    let availableCount = 0;
    let weekendCount = 0;
    for (let day = 1; day <= daysCount; day++) {
      const dt = startOfDay(new Date(year, month, day));
      const iso = toISODateLocal(dt);
      const isPast = dt < today;
      if (isPast) continue;
      const isBlocked = blocked.has(iso);
      if (isBlocked) blockedCount++;
      else availableCount++;
      const dow = dt.getDay(); // 0=Sun, 6=Sat
      const isWeekend = dow === 0 || dow === 6;
      if (!isBlocked && isWeekend) weekendCount++;
    }
    return { blockedCount, availableCount, weekendCount };
  }, [blocked, daysCount, month, today, year]);

  const blockRemainingMonth = useCallback(async () => {
    if (!djProfileId) return;
    setError(null);
    const toBlock: string[] = [];
    for (let day = 1; day <= daysCount; day++) {
      const dt = startOfDay(new Date(year, month, day));
      if (dt < today) continue;
      const iso = toISODateLocal(dt);
      if (!blocked.has(iso)) toBlock.push(iso);
    }
    if (toBlock.length === 0) {
      showToast("Geen wijzigingen");
      return;
    }

    // Optimistic
    setBlocked((prev) => {
      const n = new Set(prev);
      for (const iso of toBlock) n.add(iso);
      return n;
    });
    showToast("Maand geblokkeerd");

    const { error: insErr } = await supabase.from("dj_availability").insert(
      toBlock.map((iso) => ({
        dj_id: djProfileId,
        blocked_date: iso,
      })),
    );
    if (insErr) {
      // Rollback
      setBlocked((prev) => {
        const n = new Set(prev);
        for (const iso of toBlock) n.delete(iso);
        return n;
      });
      setError(insErr.message);
      showToast("Opslaan mislukt");
    }
  }, [blocked, daysCount, djProfileId, month, showToast, today, year]);

  const unblockMonth = useCallback(async () => {
    if (!djProfileId) return;
    setError(null);
    const toUnblock: string[] = [];
    for (let day = 1; day <= daysCount; day++) {
      const dt = startOfDay(new Date(year, month, day));
      const iso = toISODateLocal(dt);
      if (blocked.has(iso)) toUnblock.push(iso);
    }
    if (toUnblock.length === 0) {
      showToast("Geen wijzigingen");
      return;
    }

    // Optimistic
    setBlocked((prev) => {
      const n = new Set(prev);
      for (const iso of toUnblock) n.delete(iso);
      return n;
    });
    showToast("Maand vrijgegeven");

    const { error: delErr } = await supabase
      .from("dj_availability")
      .delete()
      .eq("dj_id", djProfileId)
      .in("blocked_date", toUnblock);
    if (delErr) {
      // Rollback
      setBlocked((prev) => {
        const n = new Set(prev);
        for (const iso of toUnblock) n.add(iso);
        return n;
      });
      setError(delErr.message);
      showToast("Opslaan mislukt");
    }
  }, [blocked, daysCount, djProfileId, month, showToast, year]);

  if (loading) {
    return (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Beschikbaarheid
        </h1>
        <p className="mt-2 text-sm text-slate-600">Kalender laden…</p>
      </>
    );
  }

  if (!djProfileId) {
    return (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Beschikbaarheid
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Je hebt nog geen DJ-profiel. Maak eerst een profiel aan om data te blokkeren.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Beschikbaarheid
        </h1>
        <p className="text-sm text-gray-600">
          Tik op een datum om deze te blokkeren of vrij te geven. Wij slaan dit automatisch op.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-5 lg:items-start">
        {/* Calendar column */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            {/* Quick actions */}
            <div className="mb-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => void blockRemainingMonth()}
                className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-600"
              >
                Blokkeer hele maand
              </button>
              <button
                type="button"
                onClick={() => void unblockMonth()}
                className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-600"
              >
                Maand vrijgeven
              </button>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="Vorige maand"
                onClick={() => setCursor(new Date(year, month - 1, 1))}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" aria-hidden />
              </button>
              <div className="flex-1 text-center">
                <div className="text-2xl font-black text-gray-900 capitalize">
                  {MONTHS_NL[month]} {year}
                </div>
              </div>
              <button
                type="button"
                aria-label="Volgende maand"
                onClick={() => setCursor(new Date(year, month + 1, 1))}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" aria-hidden />
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 py-3 text-center text-xs font-semibold text-gray-400 uppercase">
              {WEEKDAYS_NL_UPPER.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((day, i) => {
                if (day == null) {
                  return <div key={`e-${i}`} className="aspect-square" />;
                }
                const cellDate = startOfDay(new Date(year, month, day));
                const iso = toISODateLocal(cellDate);
                const isPast = cellDate < today;
                const isToday = cellDate.getTime() === today.getTime();
                const isBlocked = blocked.has(iso);
                const isWorking = pendingIso === iso;

                const base =
                  "relative flex flex-col items-center justify-center rounded-xl text-sm font-semibold select-none " +
                  "aspect-square min-h-[44px] md:min-h-[52px] " +
                  (isPast ? "cursor-not-allowed " : "cursor-pointer active:scale-95 transition-all ");

                const state = isPast
                  ? "bg-transparent text-gray-300"
                  : isBlocked
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-green-50 text-green-700 hover:bg-green-100";

                const todayRing = isToday
                  ? " ring-2 ring-green-500 ring-offset-1 ring-offset-white text-green-700 font-black"
                  : "";

                return (
                  <button
                    key={`${year}-${month}-${day}`}
                    type="button"
                    disabled={isPast || isWorking}
                    onClick={() => void toggleDate(day)}
                    className={base + state + todayRing}
                    aria-label={`${day} ${MONTHS_NL[month]} ${year}`}
                  >
                    <span className="leading-none">{isWorking ? "…" : day}</span>
                    {!isPast && isBlocked ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mx-auto mt-0.5" />
                    ) : (
                      <div className="h-[6px]" aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="font-bold text-gray-900 mb-3">Legenda</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-50 rounded-lg border border-green-200" />
                <span className="text-sm text-gray-600">Beschikbaar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-50 rounded-lg border border-red-200" />
                <span className="text-sm text-gray-600">Niet beschikbaar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-transparent rounded-lg border border-gray-100" />
                <span className="text-sm text-gray-300">Verleden</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-4">
            <p className="font-bold text-gray-900 mb-3">Deze maand</p>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Beschikbare dagen</span>
                <span className="text-sm font-bold text-green-600">
                  {monthStats.availableCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Geblokkeerde dagen</span>
                <span className="text-sm font-bold text-red-500">
                  {monthStats.blockedCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Beschikbare weekenden</span>
                <span className="text-sm font-bold text-gray-900">
                  {monthStats.weekendCount}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mt-4">
            <p className="text-sm font-semibold text-green-800 mb-1">Tip</p>
            <p className="text-sm text-green-700">
              Houd je kalender up-to-date. DJ&apos;s met accurate beschikbaarheid krijgen meer
              boekingen.
            </p>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-xl shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      ) : null}
    </>
  );
}
