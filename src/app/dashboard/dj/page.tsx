"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DjOnboardingChecklist } from "@/components/dj-onboarding-checklist";
import { DashboardBookingsSkeleton, EmptyState } from "@/components/skeleton";
import { supabase } from "@/lib/supabase-browser";

function formatEuroFromCents(cents: number | null | undefined): string {
  if (typeof cents !== "number" || Number.isNaN(cents)) {
    return "€0";
  }
  const euros = cents / 100;
  return `€${euros.toLocaleString("nl-NL", {
    minimumFractionDigits: Number.isInteger(euros) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatEventDate(isoDate: string | null | undefined): string {
  if (!isoDate || typeof isoDate !== "string") return "—";
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function payoutExpectedLabel(eventDateStr: string | null | undefined): string {
  if (!eventDateStr || typeof eventDateStr !== "string") return "—";
  const d = new Date(`${eventDateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  d.setDate(d.getDate() + 2);
  return d.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function hoursUntilExpiry(expiresAt: string | null | undefined): number | null {
  if (!expiresAt) return null;
  const end = new Date(expiresAt).getTime();
  if (Number.isNaN(end)) return null;
  const ms = end - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60));
}

type UserEmbed = {
  full_name?: string | null;
  email?: string | null;
};

type BookingRow = {
  id: string;
  status?: string | null;
  event_date?: string | null;
  start_time?: string | null;
  hours?: number | string | null;
  venue_address?: string | null;
  location?: string | null;
  event_type?: string | null;
  customer_message?: string | null;
  total_amount?: number | null;
  dj_payout?: number | null;
  expires_at?: string | null;
  users?: UserEmbed | UserEmbed[] | null;
};

function getCustomerName(booking: BookingRow): string {
  const u = booking.users;
  const row = Array.isArray(u) ? u[0] : u;
  const name = typeof row?.full_name === "string" ? row.full_name.trim() : "";
  if (name) return name;
  if (typeof row?.email === "string" && row.email.trim()) return row.email.trim();
  return "Klant";
}

function venueLine(b: BookingRow): string {
  const v = b.venue_address ?? b.location;
  return typeof v === "string" && v.trim() ? v.trim() : "—";
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

export default function DjDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [djProfileId, setDjProfileId] = useState<string | null>(null);
  const [noProfile, setNoProfile] = useState(false);
  const [pending, setPending] = useState<BookingRow[]>([]);
  const [confirmed, setConfirmed] = useState<BookingRow[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);
  const [onboardingPhotos, setOnboardingPhotos] = useState<unknown>(null);
  const [onboardingVideoUrl, setOnboardingVideoUrl] = useState<unknown>(null);
  const [onboardingInstagram, setOnboardingInstagram] = useState<unknown>(null);
  const [onboardingSoundcloud, setOnboardingSoundcloud] = useState<unknown>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setNoProfile(false);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setLoadError("Geen sessie.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("dj_profiles")
      .select("id, photos, video_url, instagram_url, soundcloud_url")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (profileError) {
      setLoadError(profileError.message);
      setLoading(false);
      return;
    }

    if (!profile?.id) {
      setNoProfile(true);
      setDjProfileId(null);
      setOnboardingPhotos(null);
      setOnboardingVideoUrl(null);
      setOnboardingInstagram(null);
      setOnboardingSoundcloud(null);
      setPending([]);
      setConfirmed([]);
      setLoading(false);
      return;
    }

    const djId = profile.id as string;
    setDjProfileId(djId);
    setOnboardingPhotos((profile as { photos?: unknown }).photos ?? null);
    setOnboardingVideoUrl((profile as { video_url?: unknown }).video_url ?? null);
    setOnboardingInstagram((profile as { instagram_url?: unknown }).instagram_url ?? null);
    setOnboardingSoundcloud((profile as { soundcloud_url?: unknown }).soundcloud_url ?? null);

    const [pendingRes, confirmedRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("*, users!bookings_customer_id_fkey(full_name, email)")
        .eq("dj_id", djId)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("bookings")
        .select("*, users!bookings_customer_id_fkey(full_name, email)")
        .eq("dj_id", djId)
        .eq("status", "confirmed")
        .order("created_at", { ascending: false }),
    ]);

    if (pendingRes.error) {
      setLoadError(pendingRes.error.message);
      setLoading(false);
      return;
    }
    if (confirmedRes.error) {
      setLoadError(confirmedRes.error.message);
      setLoading(false);
      return;
    }

    setPending((pendingRes.data ?? []) as BookingRow[]);
    setConfirmed((confirmedRes.data ?? []) as BookingRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAccept = useCallback(
    async (bookingId: string) => {
      if (!djProfileId) return;
      setActionId(bookingId);
      const { error } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId)
        .eq("dj_id", djProfileId);
      setActionId(null);
      if (error) {
        setLoadError(error.message);
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        try {
          await fetch("/api/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              type: "booking_confirmed",
              bookingId,
            }),
          });
        } catch {
          /* e-mailfout blokkeert acceptatie niet */
        }
      }
      await loadData();
    },
    [djProfileId, loadData],
  );

  const handleDecline = useCallback(
    async (bookingId: string) => {
      if (!djProfileId) return;
      setActionId(bookingId);
      const { error } = await supabase
        .from("bookings")
        .update({ status: "declined" })
        .eq("id", bookingId)
        .eq("dj_id", djProfileId);
      setActionId(null);
      if (error) {
        setLoadError(error.message);
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        try {
          await fetch("/api/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              type: "booking_declined",
              bookingId,
            }),
          });
        } catch {
          /* e-mailfout blokkeert afwijzen niet */
        }
      }
      await loadData();
    },
    [djProfileId, loadData],
  );

  if (loading) {
    return (
      <div>
        <div className="h-8 w-56 animate-pulse rounded-lg bg-neutral-200" />
        <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-neutral-200" />
        <div className="mt-10">
          <DashboardBookingsSkeleton rows={3} />
        </div>
      </div>
    );
  }

  if (noProfile) {
    return (
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
            <path d="M12 3v4M12 17v4M4.5 7.5l3 3M16.5 13.5l3 3M3 12h4M17 12h4M4.5 16.5l3-3M16.5 10.5l3-3" />
            <circle cx="12" cy="12" r="3.5" />
          </svg>
        }
        title="Nog geen DJ-profiel"
        description="Maak je profiel aan om vindbaar te worden, aanvragen te ontvangen en veilig uitbetaald te worden via bookadj."
        action={
          <Link
            href="/dashboard/dj/profiel-aanmaken"
            className="inline-flex rounded-xl bg-bookadj px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-bookadj-hover"
          >
            Profiel aanmaken
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-14 bg-white">
      {loadError ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      {djProfileId ? (
        <DjOnboardingChecklist
          djProfileId={djProfileId}
          photos={onboardingPhotos}
          videoUrl={onboardingVideoUrl}
          instagramUrl={onboardingInstagram}
          soundcloudUrl={onboardingSoundcloud}
        />
      ) : null}

      <section aria-labelledby="nieuwe-aanvragen-heading">
        <h1
          id="nieuwe-aanvragen-heading"
          className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
        >
          Nieuwe aanvragen
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Inbox — klanten die je willen boeken. Reageer voordat de aanvraag
          verloopt.
        </p>

        {pending.length === 0 ? (
          <div className="mt-6">
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
                  <path d="M4 6h16v10H4z" />
                  <path d="M8 10h8M8 14h5" strokeLinecap="round" />
                </svg>
              }
              title="Inbox is leeg"
              description="Zodra een klant een aanvraag stuurt, verschijnt die hier. Zorg dat je profiel compleet en live is."
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {pending.map((req) => {
              const h = hoursUntilExpiry(req.expires_at);
              const busy = actionId === req.id;
              const start =
                typeof req.start_time === "string" && req.start_time.trim()
                  ? req.start_time.trim()
                  : "—";
              const msg =
                typeof req.customer_message === "string" &&
                req.customer_message.trim()
                  ? req.customer_message.trim()
                  : null;

              return (
                <li key={req.id}>
                  <article className="card-interactive p-5 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold text-neutral-900">
                              {getCustomerName(req)}
                            </h2>
                          </div>
                          {h !== null ? (
                            <p
                              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                                h === 0
                                  ? "bg-red-50 text-red-900 ring-red-500/30"
                                  : "bg-amber-100 text-amber-950 ring-amber-500/30"
                              }`}
                            >
                              {h === 0
                                ? "Verlopen"
                                : `Vervalt over ${h} uur`}
                            </p>
                          ) : null}
                        </div>

                        <dl className="grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <dt className="text-neutral-500">Datum</dt>
                            <dd className="font-medium text-neutral-900">
                              {formatEventDate(req.event_date)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-neutral-500">Starttijd</dt>
                            <dd className="font-medium text-neutral-900">
                              {start}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-neutral-500">Duur</dt>
                            <dd className="font-medium text-neutral-900">
                              {hoursValue(req)} uur
                            </dd>
                          </div>
                          <div>
                            <dt className="text-neutral-500">Locatie</dt>
                            <dd className="font-medium text-neutral-900">
                              {venueLine(req)}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-neutral-500">Type evenement</dt>
                            <dd className="font-medium text-neutral-900">
                              {typeof req.event_type === "string" &&
                              req.event_type.trim()
                                ? req.event_type.trim()
                                : "—"}
                            </dd>
                          </div>
                        </dl>

                        {msg ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                              Bericht van klant
                            </p>
                            <p className="mt-1.5 rounded-lg bg-neutral-50 px-3 py-2.5 text-sm text-neutral-800">
                              {msg}
                            </p>
                          </div>
                        ) : null}

                        <div className="flex flex-wrap gap-6 border-t border-neutral-100 pt-4">
                          <div>
                            <p className="text-xs text-neutral-500">Bruto</p>
                            <p className="text-lg font-bold text-neutral-900">
                              {formatEuroFromCents(req.total_amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">
                              Jouw verdienste na 15% platformkosten
                            </p>
                            <p className="text-lg font-bold text-bookadj">
                              {formatEuroFromCents(req.dj_payout)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:w-44 lg:flex-col">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleAccept(req.id)}
                          className="rounded-lg bg-bookadj px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-bookadj-hover disabled:opacity-50"
                        >
                          {busy ? "Bezig…" : "Accepteren"}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleDecline(req.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 transition-colors hover:bg-red-100 disabled:opacity-50"
                        >
                          Afwijzen
                        </button>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="bevestigde-heading">
        <h2
          id="bevestigde-heading"
          className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl"
        >
          Bevestigde boekingen
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Geplande optredens en verwachte uitbetaling (datum evenement + 2 dagen).
        </p>

        {confirmed.length === 0 ? (
          <div className="mt-6">
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
                  <path d="M8 2v4M16 2v4M4 8h16v12H4z" strokeLinejoin="round" />
                  <path d="M8 14h8" strokeLinecap="round" />
                </svg>
              }
              title="Nog geen bevestigde boekingen"
              description="Na acceptatie van een aanvraag verschijnen geplande optredens hier, inclusief verwachte uitbetaling."
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {confirmed.map((b) => {
              const start =
                typeof b.start_time === "string" && b.start_time.trim()
                  ? b.start_time.trim()
                  : "—";
              return (
                <li key={b.id}>
                  <article className="card-interactive p-5 sm:p-6">
                    <div className="min-w-0 space-y-3">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {getCustomerName(b)}
                      </h3>
                      <dl className="grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-neutral-500">Datum evenement</dt>
                          <dd className="font-medium text-neutral-900">
                            {formatEventDate(b.event_date)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-neutral-500">Starttijd</dt>
                          <dd className="font-medium text-neutral-900">
                            {start}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-neutral-500">Duur</dt>
                          <dd className="font-medium text-neutral-900">
                            {hoursValue(b)} uur
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-neutral-500">Locatie</dt>
                          <dd className="font-medium text-neutral-900">
                            {venueLine(b)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-neutral-500">Netto uitbetaling</dt>
                          <dd className="text-lg font-bold text-bookadj">
                            {formatEuroFromCents(b.dj_payout)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-neutral-500">
                            Uitbetaling verwacht op
                          </dt>
                          <dd className="font-medium text-neutral-900">
                            {payoutExpectedLabel(b.event_date)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
