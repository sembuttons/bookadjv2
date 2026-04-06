"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  getDisplayName,
  type DjProfileRow,
} from "@/lib/dj-profile-helpers";
import { supabase } from "@/lib/supabase-browser";

type BookingRow = Record<string, unknown> & { id: string };

function formatEventDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatReference(booking: BookingRow | null, id: string): string {
  if (!booking) return `#BKA-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  const ref =
    booking.reference ??
    booking.reference_code ??
    booking.booking_reference;
  if (typeof ref === "string" && ref.trim()) {
    const r = ref.trim().toUpperCase();
    if (r.startsWith("#")) return r;
    return r.startsWith("BKA-") ? `#${r}` : `#BKA-${r.replace(/^BKA-?/i, "")}`;
  }
  return `#BKA-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function totalAsEuro(booking: BookingRow): number {
  const t = booking.total_amount;
  if (typeof t === "number" && !Number.isNaN(t)) {
    if (Number.isInteger(t) && t >= 100) {
      return t / 100;
    }
    return t;
  }
  if (typeof t === "string") {
    const n = parseFloat(t);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function venueLine(booking: BookingRow): string {
  const v = booking.venue_address ?? booking.location;
  return typeof v === "string" && v.trim() ? v.trim() : "—";
}

const timelineSteps = [
  {
    when: "Nu",
    text: "DJ is op de hoogte gesteld",
    dot: "bg-blue-500",
    ring: "ring-blue-200",
  },
  {
    when: "Binnen 24 uur",
    text: "DJ accepteert (of reageert op je aanvraag)",
    dot: "bg-bookadj",
    ring: "ring-line-brand/40",
  },
  {
    when: "7 dagen voor het evenement",
    text: "Vroege herinnering",
    dot: "bg-caution",
    ring: "ring-orange-200",
  },
  {
    when: "24 uur voor het evenement",
    text: "Dag-van herinnering",
    dot: "bg-caution",
    ring: "ring-orange-200",
  },
  {
    when: "2 uur na afloop",
    text: "Review-uitnodiging",
    dot: "bg-bookadj",
    ring: "ring-line-brand/40",
  },
  {
    when: "48 uur na afloop",
    text: "Uitbetaling aan DJ",
    dot: "bg-bookadj",
    ring: "ring-line-brand/40",
  },
] as const;

export default function BevestigingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingIdRaw = params.bookingId;
  const bookingId =
    typeof bookingIdRaw === "string" ? bookingIdRaw : bookingIdRaw?.[0] ?? "";

  const [authReady, setAuthReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [dj, setDj] = useState<DjProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        router.replace(
          `/auth?redirect=${encodeURIComponent(`/bevestiging/${bookingId}`)}`,
        );
        return;
      }
      setUserEmail(session.user.email ?? null);
      setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router, bookingId]);

  useEffect(() => {
    if (!authReady || !bookingId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) {
        setLoadError("Geen sessie.");
        setLoading(false);
        return;
      }

      const { data: b, error: bErr } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .maybeSingle();

      if (cancelled) return;
      if (bErr || !b) {
        setLoadError(bErr?.message ?? "Boeking niet gevonden.");
        setBooking(null);
        setDj(null);
        setLoading(false);
        return;
      }

      const row = b as BookingRow;
      const ownerCustomer =
        typeof row.customer_id === "string" && row.customer_id === uid;
      const ownerLegacy =
        typeof row.user_id === "string" && row.user_id === uid;
      if (!ownerCustomer && !ownerLegacy) {
        setLoadError("Geen toegang tot deze boeking.");
        setBooking(null);
        setDj(null);
        setLoading(false);
        return;
      }

      setBooking(row);

      const djId = typeof row.dj_id === "string" ? row.dj_id : null;
      if (djId) {
        const { data: d } = await supabase
          .from("dj_profiles")
          .select("*")
          .eq("id", djId)
          .maybeSingle();
        if (!cancelled && d) {
          setDj(d as DjProfileRow);
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, bookingId]);

  const djName = dj ? getDisplayName(dj) : "DJ";
  const eventDate =
    typeof booking?.event_date === "string" ? booking.event_date : "";
  const startTime =
    typeof booking?.start_time === "string" ? booking.start_time : "";
  const location = booking ? venueLine(booking) : "—";
  const totalEuro = booking ? totalAsEuro(booking) : 0;

  const reference = formatReference(booking, bookingId);

  if (!authReady || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface font-sans">
        <p className="text-ink-secondary">Laden…</p>
      </div>
    );
  }

  if (loadError || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 font-sans text-center">
        <p className="text-ink">{loadError ?? "Boeking niet gevonden."}</p>
        <Link href="/" className="mt-4 text-sm font-semibold underline">
          Terug naar home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <Navbar />

      {/* Alle stappen voltooid */}
      <div className="border-b border-line bg-surface-muted">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <ol className="flex items-center justify-between gap-2 text-xs font-semibold sm:text-sm">
            {(
              [
                "Evenementdetails",
                "Betaling",
                "Bevestiging",
              ] as const
            ).map((label, i) => (
              <li
                key={label}
                className="contents"
                aria-label={label}
              >
                <div className="flex flex-1 flex-col items-center gap-2 sm:flex-row sm:justify-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bookadj text-white sm:h-10 sm:w-10">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="text-center text-ink sm:text-left">
                    {label}
                  </span>
                </div>
                {i < 2 ? (
                  <div
                    className="hidden h-px min-w-[1rem] flex-1 bg-bookadj-soft sm:block"
                    aria-hidden
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
          <div className="bg-app px-6 py-8 text-center sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bookadj text-white shadow-lg shadow-bookadj/30">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
              Aanvraag verstuurd!
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-secondary">
              De DJ heeft maximaal 24 uur om te reageren. Je ontvangt een
              e-mail zodra er nieuws is — houd je inbox in de gaten.
            </p>
          </div>

          <div className="border-t border-line/60 px-6 py-8 sm:px-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Boekingsgegevens
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-ink-muted">DJ</dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {djName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Referentie</dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold text-ink">
                  {reference}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Datum</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {formatEventDate(eventDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Tijd</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {startTime || "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-ink-muted">Locatie</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {location}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-ink-muted">Totaalbedrag</dt>
                <dd className="mt-0.5 text-lg font-bold text-ink">
                  €{totalEuro.toLocaleString("nl-NL")}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-line/60 px-6 py-8 sm:px-10">
            <h2 className="text-lg font-bold text-ink">
              Wat gebeurt er nu?
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                "De DJ heeft 24 uur om te reageren",
                "Je ontvangt een e-mail zodra de DJ reageert",
                "Na acceptatie wordt je betaling verwerkt",
              ].map((t, i) => (
                <div
                  key={t}
                  className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Stap {i + 1}
                  </p>
                  <p className="mt-1 font-semibold text-ink">{t}</p>
                </div>
              ))}
            </div>
            <ul className="relative mt-6 space-y-0">
              {timelineSteps.map((step, index) => (
                <li key={step.when} className="relative flex gap-4 pb-8 last:pb-0">
                  {index < timelineSteps.length - 1 ? (
                    <div
                      className="absolute left-[11px] top-6 h-[calc(100%-0.5rem)] w-px bg-line/50"
                      aria-hidden
                    />
                  ) : null}
                  <div className="relative z-10 shrink-0">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${step.dot} ring-2 ${step.ring}`}
                    />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      {step.when}
                    </p>
                    <p className="mt-1 text-sm font-medium text-ink">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 border-t border-line/60 bg-surface-muted px-6 py-8 sm:flex-row sm:px-10">
            <Link
              href="/dashboard/klant"
              className="flex flex-1 items-center justify-center rounded-xl bg-line px-6 py-3.5 text-center text-sm font-bold text-white hover:bg-line/80"
            >
              Naar mijn boekingen
            </Link>
            <Link
              href="/"
              className="flex flex-1 items-center justify-center rounded-xl border-2 border-line-brand bg-surface px-6 py-3.5 text-center text-sm font-bold text-ink hover:bg-surface-muted"
            >
              Terug naar home
            </Link>
          </div>

          <div className="border-t border-line bg-surface px-6 py-5 sm:px-10">
            <p className="text-center text-sm text-ink-secondary">
              We hebben een bevestiging gestuurd naar{" "}
              <span className="font-semibold text-ink">
                {userEmail ?? "je e-mailadres"}
              </span>
              . Controleer ook je spamfolder.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
