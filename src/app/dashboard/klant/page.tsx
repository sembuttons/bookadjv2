"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getStageName,
  type DjProfileRow,
} from "@/lib/dj-profile-helpers";
import { DashboardBookingsSkeleton, EmptyState } from "@/components/skeleton";
import { supabase } from "@/lib/supabase-browser";

type FilterTab = "alle" | "pending" | "confirmed" | "completed" | "cancelled";

type DjEmbed = {
  stage_name?: string | null;
  city?: string | null;
  genres?: unknown;
  hourly_rate?: number | null;
  user_id?: string | null;
} | null;

type BookingRow = {
  id: string;
  status?: string | null;
  event_date?: string | null;
  start_time?: string | null;
  hours?: number | string | null;
  venue_address?: string | null;
  location?: string | null;
  event_type?: string | null;
  total_amount?: number | null;
  dj_profiles?: DjEmbed | DjEmbed[];
};

function normalizeStatus(raw: string | null | undefined): string {
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

function filterCategory(
  status: string,
): "pending" | "confirmed" | "completed" | "cancelled" | "other" {
  if (status === "pending") return "pending";
  if (status === "confirmed") return "confirmed";
  if (status === "completed") return "completed";
  if (status === "cancelled" || status === "declined") return "cancelled";
  return "other";
}

function initialsFromStage(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "DJ"
  );
}

function formatEventDate(isoDate: string | null | undefined): string {
  if (!isoDate || typeof isoDate !== "string") return "-";
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatEuroFromCents(cents: number | null | undefined): string {
  if (typeof cents !== "number" || Number.isNaN(cents)) return "€0";
  const euros = cents / 100;
  return `€${euros.toLocaleString("nl-NL", {
    minimumFractionDigits: Number.isInteger(euros) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function venueLine(b: BookingRow): string {
  const v = b.venue_address ?? b.location;
  return typeof v === "string" && v.trim() ? v.trim() : "-";
}

function hoursValue(b: BookingRow): number {
  const h = b.hours;
  if (typeof h === "number" && !Number.isNaN(h)) return h;
  if (typeof h === "string") {
    const n = parseInt(h, 10);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function getDjProfile(booking: BookingRow): DjProfileRow | null {
  const p = booking.dj_profiles;
  const row = Array.isArray(p) ? p[0] : p;
  if (row && typeof row === "object") {
    return row as DjProfileRow;
  }
  return null;
}

function eventStartMs(
  eventDate: string | null | undefined,
  startTime: string | null | undefined,
): number | null {
  if (!eventDate || typeof eventDate !== "string") return null;
  const parts = eventDate.split("-").map((x) => parseInt(x, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, mo, d] = parts;
  let hh = 0;
  let mm = 0;
  if (typeof startTime === "string" && startTime.trim()) {
    const t = startTime.trim().split(":");
    hh = parseInt(t[0] ?? "0", 10) || 0;
    mm = parseInt(t[1] ?? "0", 10) || 0;
  }
  const dt = new Date(y, mo - 1, d, hh, mm, 0, 0);
  const ms = dt.getTime();
  return Number.isNaN(ms) ? null : ms;
}

function calendarDaysUntilEvent(eventDateStr: string): number {
  const parts = eventDateStr.split("-").map((x) => parseInt(x, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return 0;
  const [y, mo, d] = parts;
  const event = new Date(y, mo - 1, d);
  event.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((event.getTime() - today.getTime()) / 86400000);
}

function statusBadge(statusNorm: string) {
  const cat = filterCategory(statusNorm);
  switch (cat) {
    case "pending":
      return {
        className:
          "border border-amber-200 bg-amber-50 text-amber-700",
        label: "Wacht op reactie",
      };
    case "confirmed":
      return {
        className:
          "border border-green-200 bg-green-50 text-green-700",
        label: "Bevestigd",
      };
    case "completed":
      return {
        className:
          "border border-gray-200 bg-gray-100 text-gray-700",
        label: "Afgerond",
      };
    case "cancelled":
      return {
        className: "border border-red-200 bg-red-50 text-red-700",
        label: "Geannuleerd",
      };
    default:
      return {
        className: "border border-gray-200 bg-gray-100 text-gray-600",
        label: statusNorm || "Onbekend",
      };
  }
}

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "pending", label: "Aangevraagd" },
  { id: "confirmed", label: "Bevestigd" },
  { id: "completed", label: "Afgelopen" },
  { id: "cancelled", label: "Geannuleerd" },
];

export default function KlantDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [filter, setFilter] = useState<FilterTab>("alle");
  const [actionId, setActionId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setLoadError("Geen sessie.");
      setBookings([]);
      setLoading(false);
      return;
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      setLoadError(
        "Geen e-mailadres op je account. Vul dit aan en probeer opnieuw.",
      );
      setBookings([]);
      setLoading(false);
      return;
    }

    const { error: upsertUserError } = await supabase.from("users").upsert(
      {
        id: session.user.id,
        email: userEmail,
        role: (session.user.user_metadata?.role as string | undefined) ?? "klant",
        full_name:
          (session.user.user_metadata?.full_name as string | undefined) ?? null,
        created_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (upsertUserError) {
      // If this fails (RLS/network), don't block the dashboard.
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(
        "*, dj_profiles(stage_name, city, genres, hourly_rate, user_id)",
      )
      .eq("customer_id", session.user.id)
      .order("event_date", { ascending: true });

    if (error) {
      setLoadError(error.message);
      setBookings([]);
    } else {
      setBookings((data ?? []) as BookingRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const filteredBookings = useMemo(() => {
    if (filter === "alle") return bookings;
    return bookings.filter((b) => {
      const cat = filterCategory(normalizeStatus(b.status));
      if (filter === "cancelled") return cat === "cancelled";
      return cat === filter;
    });
  }, [bookings, filter]);

  const upcomingBannerBooking = useMemo(() => {
    const now = Date.now();
    const candidates = bookings.filter((b) => {
      if (normalizeStatus(b.status) !== "confirmed") return false;
      const ms = eventStartMs(b.event_date, b.start_time);
      return ms != null && ms > now;
    });
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => {
      const ma = eventStartMs(a.event_date, a.start_time) ?? Infinity;
      const mb = eventStartMs(b.event_date, b.start_time) ?? Infinity;
      return ma - mb;
    });
    return candidates[0] ?? null;
  }, [bookings]);

  const upcomingDjUserId = useMemo(() => {
    const dj = upcomingBannerBooking ? getDjProfile(upcomingBannerBooking) : null;
    const uid = (dj as any)?.user_id;
    return typeof uid === "string" && uid.trim() ? uid.trim() : null;
  }, [upcomingBannerBooking]);

  const handleCancel = useCallback(
    async (bookingId: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;
      setActionId(bookingId);
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
        .eq("customer_id", session.user.id);
      setActionId(null);
      if (error) {
        setLoadError(error.message);
        return;
      }
      await loadBookings();
    },
    [loadBookings],
  );

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-gray-200" />
        <div className="mt-10">
          <DashboardBookingsSkeleton rows={4} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Mijn boekingen
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Overzicht van je aanvragen en bevestigde optredens.
      </p>

      {loadError ? (
        <p
          className="mt-6 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-400"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      {upcomingBannerBooking ? (
        <section
          className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white text-slate-900 shadow-sm"
          aria-label="Aankomend evenement"
        >
          {upcomingDjUserId ? (
            <div className="bg-green-50 px-5 py-3">
              <p className="text-sm font-semibold text-green-800">
                Je boeking is bevestigd!{" "}
                <Link
                  href={`/berichten/${encodeURIComponent(upcomingDjUserId)}`}
                  className="font-bold text-green-700 underline underline-offset-4 hover:text-green-800"
                >
                  Start het gesprek met je DJ →
                </Link>
              </p>
            </div>
          ) : (
          <div className="bg-green-50 px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
              Aankomend evenement
            </p>
          </div>
          )}
          <div className="flex flex-col gap-6 px-5 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                {getStageName(
                  getDjProfile(upcomingBannerBooking) ?? {
                    id: "",
                    stage_name: "DJ",
                  },
                )}
              </p>
              <ul className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <li>
                  <span className="text-slate-500">Datum</span>{" "}
                  <span className="font-medium text-slate-900">
                    {formatEventDate(upcomingBannerBooking.event_date)}
                  </span>
                </li>
                <li>
                  <span className="text-slate-500">Tijd</span>{" "}
                  <span className="font-medium text-slate-900">
                    {typeof upcomingBannerBooking.start_time === "string" &&
                    upcomingBannerBooking.start_time.trim()
                      ? upcomingBannerBooking.start_time.trim()
                      : "-"}
                  </span>
                </li>
                <li className="sm:col-span-2">
                  <span className="text-slate-500">Locatie</span>{" "}
                  <span className="font-medium text-slate-900">
                    {venueLine(upcomingBannerBooking)}
                  </span>
                </li>
              </ul>
              {typeof upcomingBannerBooking.event_date === "string" &&
              upcomingBannerBooking.event_date ? (
                <p className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                  {(() => {
                    const days = calendarDaysUntilEvent(
                      upcomingBannerBooking.event_date,
                    );
                    if (days < 0) return "-";
                    if (days === 0) return "Vandaag";
                    if (days === 1) return "Nog 1 dag";
                    return `Nog ${days} dagen`;
                  })()}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href={`/dashboard/klant/berichten?booking=${encodeURIComponent(upcomingBannerBooking.id)}`}
                className="rounded-lg bg-green-500 px-5 py-2.5 text-center text-sm font-bold text-black shadow-sm transition-colors hover:bg-green-400"
              >
                Bericht DJ
              </Link>
              <Link
                href={`/bevestiging/${encodeURIComponent(upcomingBannerBooking.id)}`}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                Details
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <div
        className="mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filter boekingen"
      >
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={filter === tab.id}
            onClick={() => setFilter(tab.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab.id
                ? "border-2 border-green-500 bg-green-50 font-bold text-green-700 shadow-sm"
                : "border border-gray-200 bg-white text-slate-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden
              >
                <rect x="4" y="5" width="16" height="14" rx="2" />
                <path d="M8 10h8M8 14h4" strokeLinecap="round" />
              </svg>
            }
            title="Geen boekingen in deze weergave"
            description="Kies een andere tab of maak een nieuwe aanvraag via een DJ-profiel. Al je aanvragen en bevestigingen blijven hier bij elkaar."
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-4" aria-label="Boekingen">
          {filteredBookings.map((booking) => {
            const dj = getDjProfile(booking);
            const stageName = dj
              ? getStageName(dj)
              : "DJ";
            const st = normalizeStatus(booking.status);
            const badge = statusBadge(st);
            const busy = actionId === booking.id;
            const start =
              typeof booking.start_time === "string" &&
              booking.start_time.trim()
                ? booking.start_time.trim()
                : "-";

            return (
              <li key={booking.id}>
                <article className="card-interactive p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-bold text-slate-700"
                        aria-hidden
                      >
                        {initialsFromStage(stageName)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-slate-900">
                            {stageName}
                          </h2>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                          <div>
                            <dt className="text-gray-500">Datum & tijd</dt>
                            <dd className="font-medium text-slate-900">
                              {formatEventDate(booking.event_date)} · {start}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Locatie</dt>
                            <dd className="font-medium text-slate-900">
                              {venueLine(booking)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Soort evenement</dt>
                            <dd className="font-medium text-slate-900">
                              {typeof booking.event_type === "string" &&
                              booking.event_type.trim()
                                ? booking.event_type.trim()
                                : "-"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Duur</dt>
                            <dd className="font-medium text-slate-900">
                              {hoursValue(booking)} uur
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                    <div className="flex flex-col items-stretch gap-3 pt-4 sm:w-52 sm:shrink-0 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                      <p className="text-sm text-gray-500">Totaal betaald</p>
                      <p className="text-xl font-bold text-slate-900">
                        {formatEuroFromCents(booking.total_amount)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/bevestiging/${encodeURIComponent(booking.id)}`}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 shadow-sm hover:bg-gray-50"
                        >
                          Details
                        </Link>
                        {st === "pending" ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleCancel(booking.id)}
                            className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                          >
                            {busy ? "Bezig…" : "Annuleren"}
                          </button>
                        ) : null}
                        {st === "completed" ? (
                          <Link
                            href={`/dashboard/klant/reviews?booking=${encodeURIComponent(booking.id)}`}
                            className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-gray-200"
                          >
                            Review schrijven
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
