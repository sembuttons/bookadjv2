"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type Customer = {
  full_name?: string | null;
  email?: string | null;
} | null;

type DjProfile = {
  stage_name?: string | null;
  hourly_rate?: number | null;
  user_id?: string | null;
} | null;

type DjUser = {
  full_name?: string | null;
  email?: string | null;
} | null;

export type AdminBookingRow = {
  id: string;
  reference?: string | null;
  booking_reference?: string | null;
  status?: string | null;
  event_date?: string | null;
  start_time?: string | null;
  created_at?: string | null;
  total_amount?: number | null;
  platform_fee?: number | null;
  dj_payout?: number | null;
  hourly_rate_snapshot?: number | null;
  hours?: number | null;
  venue_address?: string | null;
  event_type?: string | null;
  customer_message?: string | null;
  expires_at?: string | null;
  payment_status?: string | null;
  customer?: Customer;
  dj_profile?: DjProfile;
  dj_user?: DjUser;
};

function bookingRef(b: AdminBookingRow): string {
  const r =
    (typeof b.reference === "string" && b.reference.trim()) ||
    (typeof b.booking_reference === "string" && b.booking_reference.trim()) ||
    "";
  return r || b.id.slice(0, 8).toUpperCase();
}

function customerLabel(b: AdminBookingRow): string {
  const c = b.customer;
  const name = c?.full_name?.trim() || "";
  if (name) return name;
  const em = c?.email?.trim() || "";
  if (em) return em.split("@")[0] || em;
  return "-";
}

function customerEmail(b: AdminBookingRow): string {
  return b.customer?.email?.trim() || "-";
}

function djLabel(b: AdminBookingRow): string {
  return b.dj_profile?.stage_name?.trim() || "-";
}

function formatEuroCents(cents: number | null | undefined): string {
  if (typeof cents !== "number" || Number.isNaN(cents)) return "€0";
  const euros = cents / 100;
  return `€${euros.toLocaleString("nl-NL", {
    minimumFractionDigits: Number.isInteger(euros) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusBadgeClasses(status: string | null | undefined): string {
  const s = (status ?? "").toLowerCase();
  if (s === "pending")
    return "bg-amber-500/20 text-amber-200 ring-amber-500/40";
  if (s === "confirmed") return "bg-blue-500/20 text-blue-200 ring-blue-500/40";
  if (s === "paid") return "bg-green-500/20 text-green-200 ring-green-500/40";
  if (s === "cancelled" || s === "declined")
    return "bg-red-500/20 text-red-200 ring-red-500/40";
  if (s === "completed") return "bg-gray-500/20 text-gray-300 ring-gray-500/40";
  return "bg-gray-600/30 text-gray-300 ring-gray-600/50";
}

function statusLabel(status: string | null | undefined): string {
  const s = (status ?? "").toLowerCase();
  if (s === "declined") return "Geannuleerd";
  return s || "-";
}

type FilterTab = "all" | "pending" | "confirmed" | "paid" | "cancelled";

export function AdminBoekingenClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<AdminBookingRow | null>(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("Geen sessie.");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/admin/bookings", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = (await res.json()) as {
      error?: string;
      bookings?: AdminBookingRow[];
    };
    if (!res.ok) {
      setError(json.error ?? "Laden mislukt.");
      setBookings([]);
    } else {
      setBookings(json.bookings ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      const st = (b.status ?? "").toLowerCase();
      if (filter === "pending" && st !== "pending") return false;
      if (filter === "confirmed" && st !== "confirmed") return false;
      if (filter === "paid" && st !== "paid") return false;
      if (filter === "cancelled" && st !== "cancelled" && st !== "declined") {
        return false;
      }
      if (!q) return true;
      const ref = bookingRef(b).toLowerCase();
      const cust = customerLabel(b).toLowerCase();
      const em = customerEmail(b).toLowerCase();
      const dj = djLabel(b).toLowerCase();
      return (
        ref.includes(q) ||
        cust.includes(q) ||
        em.includes(q) ||
        dj.includes(q)
      );
    });
  }, [bookings, filter, search]);

  const patchStatus = async (id: string, status: string) => {
    setActing(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setActing(false);
      return;
    }
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ status }),
    });
    setActing(false);
    if (res.ok) {
      setDetail((d) =>
        d && d.id === id ? { ...d, status } : d,
      );
      await load();
    }
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Alle" },
    { key: "pending", label: "In afwachting" },
    { key: "confirmed", label: "Bevestigd" },
    { key: "paid", label: "Betaald" },
    { key: "cancelled", label: "Geannuleerd" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Boekingen
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Overzicht van alle boekingen met klant- en DJ-gegevens.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                filter === t.key
                  ? "bg-green-500/20 text-green-300 ring-1 ring-green-500/40"
                  : "bg-[#111827] text-gray-400 ring-1 ring-gray-800 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op referentie, klant of DJ…"
          className="w-full max-w-md rounded-xl border border-gray-800 bg-[#111827] px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/20"
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-gray-400">Laden…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#0f172a]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Referentie</th>
                <th className="px-4 py-3">Klant</th>
                <th className="px-4 py-3">DJ</th>
                <th className="px-4 py-3">Datum event</th>
                <th className="px-4 py-3">Bedrag</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aangemaakt</th>
                <th className="px-4 py-3">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Geen boekingen gevonden.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="text-gray-200">
                    <td className="px-4 py-3 font-mono text-xs text-green-300">
                      {bookingRef(b)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">
                        {customerLabel(b)}
                      </span>
                      <br />
                      <span className="text-xs text-gray-500">
                        {customerEmail(b)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{djLabel(b)}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {b.event_date
                        ? new Date(`${b.event_date}T12:00:00`).toLocaleDateString(
                            "nl-NL",
                          )
                        : "-"}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatEuroCents(b.total_amount ?? null)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${statusBadgeClasses(b.status)}`}
                      >
                        {statusLabel(b.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {b.created_at
                        ? new Date(b.created_at).toLocaleString("nl-NL")
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDetail(b)}
                        className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-gray-700 hover:bg-gray-700"
                      >
                        Bekijk details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {detail ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 p-4 sm:p-6">
          <div
            className="absolute inset-0"
            role="presentation"
            onClick={() => setDetail(null)}
            aria-hidden
          />
          <aside className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-y-auto rounded-2xl border border-gray-800 bg-[#0f172a] shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-800 p-5">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Boeking
                </p>
                <p className="mt-1 font-mono text-lg font-bold text-green-300">
                  {bookingRef(detail)}
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${statusBadgeClasses(detail.status)}`}
                >
                  {statusLabel(detail.status)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                aria-label="Sluiten"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-6 p-5 text-sm">
              <section>
                <h3 className="text-xs font-bold uppercase text-gray-500">
                  Klant
                </h3>
                <p className="mt-2 font-semibold text-white">
                  {customerLabel(detail)}
                </p>
                <p className="text-gray-400">{customerEmail(detail)}</p>
              </section>

              <section>
                <h3 className="text-xs font-bold uppercase text-gray-500">DJ</h3>
                <p className="mt-2 font-semibold text-white">{djLabel(detail)}</p>
                <p className="text-gray-400">
                  {detail.dj_user?.full_name?.trim() ||
                    detail.dj_user?.email?.split("@")[0] ||
                    detail.dj_user?.email ||
                    "-"}
                </p>
                {detail.dj_user?.email ? (
                  <p className="text-xs text-gray-500">{detail.dj_user.email}</p>
                ) : null}
                {typeof detail.dj_profile?.hourly_rate === "number" ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Uurtarief profiel: €{detail.dj_profile.hourly_rate}
                  </p>
                ) : null}
              </section>

              <section className="grid gap-2 text-gray-300">
                <h3 className="text-xs font-bold uppercase text-gray-500">
                  Event
                </h3>
                <p>
                  <span className="text-gray-500">Datum: </span>
                  {detail.event_date ?? "-"}
                </p>
                <p>
                  <span className="text-gray-500">Starttijd: </span>
                  {detail.start_time ?? "-"}
                </p>
                <p>
                  <span className="text-gray-500">Uren: </span>
                  {detail.hours ?? "-"}
                </p>
                <p>
                  <span className="text-gray-500">Type: </span>
                  {detail.event_type ?? "-"}
                </p>
                <p>
                  <span className="text-gray-500">Locatie: </span>
                  {detail.venue_address ?? "-"}
                </p>
                {detail.customer_message ? (
                  <p className="whitespace-pre-wrap">
                    <span className="text-gray-500">Bericht: </span>
                    {detail.customer_message}
                  </p>
                ) : null}
              </section>

              <section className="rounded-xl border border-gray-800 bg-[#111827] p-4">
                <h3 className="text-xs font-bold uppercase text-gray-500">
                  Betaling
                </h3>
                <p className="mt-2 text-white">
                  Totaal: {formatEuroCents(detail.total_amount ?? null)}
                </p>
                {typeof detail.platform_fee === "number" ? (
                  <p className="text-gray-400">
                    Platform: {formatEuroCents(detail.platform_fee)}
                  </p>
                ) : null}
                {typeof detail.dj_payout === "number" ? (
                  <p className="text-gray-400">
                    DJ-uitbetaling: {formatEuroCents(detail.dj_payout)}
                  </p>
                ) : null}
                {typeof detail.hourly_rate_snapshot === "number" ? (
                  <p className="text-xs text-gray-500">
                    Uurtarief (snapshot): €{detail.hourly_rate_snapshot}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-gray-500">
                  Status (platform):{" "}
                  {detail.payment_status?.trim() || detail.status || "-"}
                </p>
                {detail.expires_at ? (
                  <p className="text-xs text-gray-500">
                    Verloopt:{" "}
                    {new Date(detail.expires_at).toLocaleString("nl-NL")}
                  </p>
                ) : null}
              </section>

              <section className="space-y-2 border-t border-gray-800 pt-4">
                <h3 className="text-xs font-bold uppercase text-gray-500">
                  Admin-acties
                </h3>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => void patchStatus(detail.id, "cancelled")}
                    className="rounded-xl bg-red-600/90 px-4 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    Annuleer boeking
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => void patchStatus(detail.id, "completed")}
                    className="rounded-xl bg-gray-700 px-4 py-3 text-sm font-bold text-white hover:bg-gray-600 disabled:opacity-50"
                  >
                    Markeer als voltooid
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      window.alert(
                        "Terugbetaling initiëren is binnenkort beschikbaar.",
                      )
                    }
                    className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-200 hover:bg-amber-500/20"
                  >
                    Terugbetaling initiëren
                  </button>
                </div>
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
