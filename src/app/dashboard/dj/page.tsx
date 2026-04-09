"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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
  if (!isoDate || typeof isoDate !== "string") return "-";
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
  if (!eventDateStr || typeof eventDateStr !== "string") return "-";
  const d = new Date(`${eventDateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "-";
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
  customer_id?: string | null;
  reference?: string | null;
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
  const em = typeof row?.email === "string" ? row.email.trim() : "";
  if (em) {
    const local = em.split("@")[0]?.trim();
    return local || em;
  }
  return "Klant";
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

type AcceptSuccessInfo = {
  customerName: string;
  eventDateLabel: string;
  reference: string;
  customerUserId: string | null;
};

const ACCEPT_SUCCESS_AUTO_CLOSE_MS = 60_000;

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
  const [acceptSuccess, setAcceptSuccess] = useState<AcceptSuccessInfo | null>(
    null,
  );
  const acceptAutoCloseRef = useRef<number | null>(null);

  const clearAcceptSuccess = useCallback(() => {
    if (acceptAutoCloseRef.current) {
      window.clearTimeout(acceptAutoCloseRef.current);
      acceptAutoCloseRef.current = null;
    }
    setAcceptSuccess(null);
  }, []);

  const scheduleAcceptSuccessAutoClose = useCallback(() => {
    if (acceptAutoCloseRef.current) {
      window.clearTimeout(acceptAutoCloseRef.current);
    }
    acceptAutoCloseRef.current = window.setTimeout(() => {
      setAcceptSuccess(null);
      acceptAutoCloseRef.current = null;
    }, ACCEPT_SUCCESS_AUTO_CLOSE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (acceptAutoCloseRef.current) {
        window.clearTimeout(acceptAutoCloseRef.current);
      }
    };
  }, []);

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

    // Auto-create user row if it doesn't exist (don't block dashboard on failure)
    try {
      await supabase.from("users").upsert(
        {
          id: session.user.id,
          email: session.user.email,
          role: (session.user.user_metadata?.role as string | undefined) ?? "klant",
          full_name:
            (session.user.user_metadata?.full_name as string | undefined) ?? null,
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
    } catch {
      /* non-blocking */
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
      const acceptedReq = pending.find((r) => r.id === bookingId);
      const customerUserId =
        typeof acceptedReq?.customer_id === "string" &&
        acceptedReq.customer_id.trim()
          ? acceptedReq.customer_id.trim()
          : null;
      const refDisplay =
        acceptedReq &&
        typeof acceptedReq.reference === "string" &&
        acceptedReq.reference.trim()
          ? acceptedReq.reference.trim()
          : bookingId.slice(0, 8).toUpperCase();

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

      // Auto-create a message thread after acceptance (DJ -> klant)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const djAuthId = session?.user?.id ?? null;
        if (djAuthId) {
          const { data: booking } = await supabase
            .from("bookings")
            .select("id, reference, event_date, customer_id, dj_id, dj_profiles(stage_name, user_id)")
            .eq("id", bookingId)
            .single();

          const b = booking as {
            id: string;
            reference?: string | null;
            event_date?: string | null;
            customer_id: string;
            dj_profiles?: { stage_name?: string | null; user_id?: string | null } | null;
          } | null;

          const customerId = b?.customer_id ?? "";
          const djUserId =
            (typeof b?.dj_profiles?.user_id === "string" && b.dj_profiles.user_id.trim()) ||
            djAuthId;

          if (customerId && djUserId) {
            const iso = typeof b?.event_date === "string" ? b.event_date : "";
            const dt = iso ? new Date(`${iso}T12:00:00`) : null;
            const niceDate = dt
              ? dt.toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "je datum";
            const niceDayMonth = dt
              ? dt.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })
              : "je datum";
            const ref =
              typeof b?.reference === "string" && b.reference.trim()
                ? b.reference.trim()
                : bookingId.slice(0, 8).toUpperCase();

            // best-effort duplicate guard
            const { data: existing } = await supabase
              .from("messages")
              .select("id, content")
              .eq("booking_id", bookingId)
              .eq("sender_id", djUserId)
              .eq("recipient_id", customerId)
              .limit(10);

            const exists = (existing as { content?: string }[] | null)?.some((r) =>
              (r.content ?? "").startsWith("Hoi! Ik heb je boekingsaanvraag geaccepteerd"),
            );

            if (!exists) {
              await supabase.from("messages").insert([
                {
                  sender_id: djUserId,
                  recipient_id: customerId,
                  content: `Hoi! Ik heb je boekingsaanvraag geaccepteerd voor ${niceDate}. Ik kijk er naar uit! Heb je nog vragen of wensen voor het event? Laat het me weten.`,
                  booking_id: bookingId,
                  inbox_type: "book_me",
                  created_at: new Date().toISOString(),
                  is_read: false,
                  is_flagged: false,
                  flag_reason: null,
                },
                {
                  sender_id: djUserId,
                  recipient_id: customerId,
                  content: `Boeking bevestigd. Referentie ${ref}. Je betaling wordt vastgehouden tot na het event op ${niceDayMonth}.`,
                  booking_id: bookingId,
                  inbox_type: "book_me",
                  created_at: new Date().toISOString(),
                  is_read: false,
                  is_flagged: false,
                  flag_reason: null,
                },
              ]);
            }
          }
        }
      } catch {
        /* messages are best-effort; don't block acceptance */
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

      setAcceptSuccess({
        customerName: acceptedReq ? getCustomerName(acceptedReq) : "Klant",
        eventDateLabel: acceptedReq
          ? formatEventDate(acceptedReq.event_date)
          : "-",
        reference: refDisplay,
        customerUserId,
      });
      scheduleAcceptSuccessAutoClose();
      await loadData();
    },
    [djProfileId, loadData, pending, scheduleAcceptSuccessAutoClose],
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
        <div className="h-8 w-56 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-gray-200" />
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
            className="inline-flex rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-green-400"
          >
            Profiel aanmaken
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-14">
      {loadError ? (
        <p
          className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-400"
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

      {djProfileId ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm leading-relaxed text-gray-700">
            <span className="font-semibold text-gray-900">bookadj</span> werkt
            met <span className="font-semibold text-gray-900">Boekingsbescherming</span>.
            Jij ontvangt altijd <span className="font-semibold text-gray-900">100% van jouw tarief</span>.
          </p>
        </div>
      ) : null}

      <section aria-labelledby="nieuwe-aanvragen-heading">
        <h1
          id="nieuwe-aanvragen-heading"
          className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
        >
          Nieuwe aanvragen
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Inbox: klanten die je willen boeken. Reageer voordat de aanvraag
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
                  : "-";
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
                            <h2 className="text-lg font-semibold text-slate-900">
                              {getCustomerName(req)}
                            </h2>
                          </div>
                          {h !== null ? (
                            <p
                              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                                h === 0
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : "border-amber-200 bg-amber-50 text-amber-700"
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
                            <dt className="text-gray-500">Datum</dt>
                            <dd className="font-medium text-slate-900">
                              {formatEventDate(req.event_date)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Starttijd</dt>
                            <dd className="font-medium text-slate-900">
                              {start}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Duur</dt>
                            <dd className="font-medium text-slate-900">
                              {hoursValue(req)} uur
                            </dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Locatie</dt>
                            <dd className="font-medium text-slate-900">
                              {venueLine(req)}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-gray-500">Type evenement</dt>
                            <dd className="font-medium text-slate-900">
                              {typeof req.event_type === "string" &&
                              req.event_type.trim()
                                ? req.event_type.trim()
                                : "-"}
                            </dd>
                          </div>
                        </dl>

                        {msg ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Bericht van klant
                            </p>
                            <p className="mt-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-slate-700">
                              {msg}
                            </p>
                          </div>
                        ) : null}

                        <div className="flex flex-wrap gap-6 pt-4">
                          <div>
                            <p className="text-xs text-gray-500">Jouw tarief</p>
                            <p className="text-lg font-bold text-slate-900">
                              {formatEuroFromCents(req.dj_payout)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Jij ontvangt</p>
                            <p className="text-lg font-bold text-green-600">
                              {formatEuroFromCents(req.dj_payout)}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              De klant betaalt {formatEuroFromCents(req.total_amount)} (incl. boekingsbescherming)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:w-44 lg:flex-col">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleAccept(req.id)}
                          className="rounded-lg bg-green-500 px-4 py-2.5 text-sm font-bold text-black shadow-sm transition-colors hover:bg-green-400 disabled:opacity-50"
                        >
                          {busy ? "Bezig…" : "Accepteren"}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleDecline(req.id)}
                          className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
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
          className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl"
        >
          Bevestigde boekingen
        </h2>
        <p className="mt-1 text-sm text-slate-600">
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
                  : "-";
              return (
                <li key={b.id}>
                  <article className="card-interactive p-5 sm:p-6">
                    <div className="min-w-0 space-y-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {getCustomerName(b)}
                      </h3>
                      <dl className="grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-gray-500">Datum evenement</dt>
                          <dd className="font-medium text-slate-900">
                            {formatEventDate(b.event_date)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Starttijd</dt>
                          <dd className="font-medium text-slate-900">
                            {start}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Duur</dt>
                          <dd className="font-medium text-slate-900">
                            {hoursValue(b)} uur
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-gray-500">Locatie</dt>
                          <dd className="font-medium text-slate-900">
                            {venueLine(b)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Jouw tarief</dt>
                          <dd className="text-lg font-bold text-slate-900">
                            {formatEuroFromCents(b.dj_payout)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Jij ontvangt</dt>
                          <dd className="text-lg font-bold text-green-600">
                            {formatEuroFromCents(b.dj_payout)}
                          </dd>
                          <p className="mt-1 text-xs text-gray-400">
                            De klant betaalt {formatEuroFromCents(b.total_amount)} (incl. boekingsbescherming)
                          </p>
                        </div>
                        <div>
                          <dt className="text-gray-500">
                            Uitbetaling verwacht op
                          </dt>
                          <dd className="font-medium text-slate-900">
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

      {acceptSuccess ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="accept-success-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2
              id="accept-success-title"
              className="mt-4 text-center text-xl font-bold text-gray-900"
            >
              Boeking geaccepteerd
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              De aanvraag staat nu bij{" "}
              <span className="font-semibold text-slate-800">
                Bevestigde boekingen
              </span>
              . De klant ontvangt een bevestiging per e-mail.
            </p>
            <dl className="mt-5 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Klant
                </dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {acceptSuccess.customerName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Datum evenement
                </dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {acceptSuccess.eventDateLabel}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Referentie
                </dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
                  {acceptSuccess.reference}
                </dd>
              </div>
            </dl>
            {acceptSuccess.customerUserId ? (
              <Link
                href={`/berichten/${encodeURIComponent(acceptSuccess.customerUserId)}`}
                className="mt-4 flex min-h-[44px] items-center justify-center rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-bold text-green-800 transition-colors hover:bg-green-100"
              >
                Open gesprek met klant
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => clearAcceptSuccess()}
              className="mt-4 w-full min-h-[44px] rounded-xl bg-green-500 px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-green-400"
            >
              Sluiten
            </button>
            <p className="mt-3 text-center text-xs text-gray-500">
              Dit venster sluit automatisch na ongeveer een minuut. Gebruik de
              knop hierboven om direct verder te gaan.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
