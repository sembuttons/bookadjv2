"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  BookingCostBreakdownCard,
  type TravelBreakdownLine,
} from "@/components/booking-cost-breakdown";
import {
  getDisplayName,
  getDjHomeCityForTravel,
  type DjProfileRow,
} from "@/lib/dj-profile-helpers";
import { supabase } from "@/lib/supabase-browser";
import { calculateServiceFee } from "@/lib/pricing";

type BookingRow = Record<string, unknown> & { id: string };

function formatEventDate(iso: string | undefined): string {
  if (!iso) return "-";
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

/** Boekingsbedragen: meestal centen (integer ≥ 100), soms al euro. */
function moneyFromBookingField(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) {
    if (Number.isInteger(v) && Math.abs(v) >= 100) {
      return v / 100;
    }
    return v;
  }
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function venueLine(booking: BookingRow): string {
  const v = booking.venue_address ?? booking.location;
  return typeof v === "string" && v.trim() ? v.trim() : "-";
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
    dot: "bg-green-500",
    ring: "ring-green-800/40",
  },
  {
    when: "7 dagen voor het evenement",
    text: "Vroege herinnering",
    dot: "bg-amber-500",
    ring: "ring-orange-200",
  },
  {
    when: "24 uur voor het evenement",
    text: "Dag-van herinnering",
    dot: "bg-amber-500",
    ring: "ring-orange-200",
  },
  {
    when: "2 uur na afloop",
    text: "Review-uitnodiging",
    dot: "bg-green-500",
    ring: "ring-green-800/40",
  },
  {
    when: "48 uur na afloop",
    text: "Uitbetaling aan DJ",
    dot: "bg-green-500",
    ring: "ring-green-800/40",
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
  const [travelLine, setTravelLine] = useState<TravelBreakdownLine>({
    state: "pending",
    label: "Wordt door DJ bevestigd",
  });

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

  useEffect(() => {
    if (!booking || !dj) return;
    let cancelled = false;
    const addrRaw = booking.venue_address ?? booking.location;
    const addr = typeof addrRaw === "string" ? addrRaw.trim() : "";
    if (!addr) {
      setTravelLine({
        state: "pending",
        label: "Wordt door DJ bevestigd",
      });
      return;
    }

    const homeCity = getDjHomeCityForTravel(dj);
    const homeLat =
      typeof dj.home_lat === "number" && Number.isFinite(dj.home_lat)
        ? dj.home_lat
        : null;
    const homeLng =
      typeof dj.home_lng === "number" && Number.isFinite(dj.home_lng)
        ? dj.home_lng
        : null;
    const hasOrigin =
      (homeLat != null && homeLng != null) ||
      (typeof homeCity === "string" && homeCity.trim().length > 0);

    if (!hasOrigin) {
      setTravelLine({
        state: "pending",
        label: "Wordt door DJ bevestigd",
      });
      return;
    }

    setTravelLine({ state: "loading" });

    (async () => {
      try {
        const res = await fetch("/api/travel-cost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            venueAddress: addr,
            homeLat,
            homeLng,
            homeCity: homeCity?.trim() || null,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          costEuro?: number;
          distanceKm?: number;
        };
        if (cancelled) return;
        if (
          res.ok &&
          data.ok &&
          typeof data.costEuro === "number" &&
          typeof data.distanceKm === "number"
        ) {
          setTravelLine({
            state: "indicative",
            euro: data.costEuro,
            returnKm: data.distanceKm,
          });
        } else {
          setTravelLine({
            state: "pending",
            label: "Wordt door DJ bevestigd",
          });
        }
      } catch {
        if (!cancelled) {
          setTravelLine({
            state: "pending",
            label: "Wordt door DJ bevestigd",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [booking, dj]);

  const djName = dj ? getDisplayName(dj) : "DJ";
  const eventDate =
    typeof booking?.event_date === "string" ? booking.event_date : "";
  const startTime =
    typeof booking?.start_time === "string" ? booking.start_time : "";
  const location = booking ? venueLine(booking) : "-";
  const totalEuro = booking ? totalAsEuro(booking) : 0;

  let djTariffEuro = booking ? moneyFromBookingField(booking.dj_payout) : 0;
  const platformFeeEuro = booking
    ? moneyFromBookingField(booking.platform_fee)
    : 0;
  if (booking && djTariffEuro <= 0 && totalEuro > 0) {
    djTariffEuro = Math.max(0, totalEuro - platformFeeEuro);
  }
  const serviceEuro =
    platformFeeEuro > 0
      ? platformFeeEuro
      : booking
        ? calculateServiceFee(djTariffEuro)
        : 0;
  const hoursBooked =
    booking &&
    typeof booking.hours === "number" &&
    booking.hours > 0
      ? booking.hours
      : null;
  const hourlySnap =
    booking &&
    typeof booking.hourly_rate_snapshot === "number" &&
    booking.hourly_rate_snapshot > 0
      ? booking.hourly_rate_snapshot
      : null;
  const hoursDisplay =
    hoursBooked ??
    (hourlySnap != null && djTariffEuro > 0
      ? Math.max(1, Math.round(djTariffEuro / hourlySnap))
      : 1);
  const hourlyDisplay =
    hourlySnap ??
    (hoursDisplay > 0 ? djTariffEuro / hoursDisplay : djTariffEuro);

  const grandTotalEuro =
    travelLine.state === "indicative"
      ? Math.round((totalEuro + travelLine.euro) * 100) / 100
      : totalEuro;

  const reference = formatReference(booking, bookingId);

  if (!authReady || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111827] font-sans">
        <p className="text-gray-400">Laden…</p>
      </div>
    );
  }

  if (loadError || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#111827] px-4 font-sans text-center">
        <p className="text-white">{loadError ?? "Boeking niet gevonden."}</p>
        <Link href="/" className="mt-4 text-sm font-semibold underline">
          Terug naar home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] font-sans text-white">
      <Navbar />

      {/* Alle stappen voltooid */}
      <div className="bg-[#0f172a]">
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
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-black font-bold sm:h-10 sm:w-10">
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
                  <span className="text-center text-white sm:text-left">
                    {label}
                  </span>
                </div>
                {i < 2 ? (
                  <div
                    className="hidden h-px min-w-[1rem] flex-1 bg-green-500-soft sm:block"
                    aria-hidden
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#111827] shadow-lg">
          <div className="bg-[#0a0a0a] px-6 py-8 text-center sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-black font-bold shadow-lg shadow-green-500/30">
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
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-400">
              De DJ heeft maximaal 24 uur om te reageren. Je ontvangt een
              e-mail zodra er nieuws is. Houd je inbox in de gaten.
            </p>
          </div>

          <div className="px-6 py-8 sm:px-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Boekingsgegevens
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-500">DJ</dt>
                <dd className="mt-0.5 font-semibold text-white">
                  {djName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Referentie</dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold text-white">
                  {reference}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Datum</dt>
                <dd className="mt-0.5 font-medium text-white">
                  {formatEventDate(eventDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Tijd</dt>
                <dd className="mt-0.5 font-medium text-white">
                  {startTime || "-"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-500">Locatie</dt>
                <dd className="mt-0.5 font-medium text-white">
                  {location}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-500">Kostenoverzicht</dt>
                <dd className="mt-2">
                  <BookingCostBreakdownCard
                    variant="dark"
                    hours={hoursDisplay}
                    hourlyRate={hourlyDisplay}
                    djTariffEuro={djTariffEuro}
                    serviceEuro={serviceEuro}
                    travel={travelLine}
                    grandTotalEuro={grandTotalEuro}
                  />
                </dd>
              </div>
            </dl>
          </div>

          <div className="px-6 py-8 sm:px-10">
            <h2 className="text-lg font-bold text-white">
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
                  className="rounded-xl border border-gray-800 bg-[#111827] px-4 py-3 text-sm text-white shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Stap {i + 1}
                  </p>
                  <p className="mt-1 font-semibold text-white">{t}</p>
                </div>
              ))}
            </div>
            <ul className="relative mt-6 space-y-0">
              {timelineSteps.map((step, index) => (
                <li key={step.when} className="relative flex gap-4 pb-8 last:pb-0">
                  {index < timelineSteps.length - 1 ? (
                    <div
                      className="absolute left-[11px] top-6 h-[calc(100%-0.5rem)] w-px bg-gray-800/50"
                      aria-hidden
                    />
                  ) : null}
                  <div className="relative z-10 shrink-0">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${step.dot} ring-2 ${step.ring}`}
                    />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      {step.when}
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 bg-[#0f172a] px-6 py-8 sm:flex-row sm:px-10">
            <Link
              href="/dashboard/klant"
              className="flex flex-1 items-center justify-center rounded-xl bg-gray-800 px-6 py-3.5 text-center text-sm font-bold text-white hover:bg-gray-700"
            >
              Naar mijn boekingen
            </Link>
            <Link
              href="/"
              className="flex flex-1 items-center justify-center rounded-xl border-2 border-green-800 bg-[#111827] px-6 py-3.5 text-center text-sm font-bold text-white hover:bg-[#0f172a]"
            >
              Terug naar home
            </Link>
          </div>

          <div className="bg-[#111827] px-6 py-5 sm:px-10">
            <p className="text-center text-sm text-gray-400">
              We hebben een bevestiging gestuurd naar{" "}
              <span className="font-semibold text-white">
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
