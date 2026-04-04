"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getDisplayName,
  type DjProfileRow,
} from "@/lib/dj-profile-helpers";
import { supabase } from "@/lib/supabase";

type BookingRow = Record<string, unknown> & { id: string };

function initials(name: string) {
  const s = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return s || "DJ";
}

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

export default function BetalenPage() {
  const router = useRouter();
  const params = useParams();
  const bookingIdRaw = params.bookingId;
  const bookingId =
    typeof bookingIdRaw === "string" ? bookingIdRaw : bookingIdRaw?.[0] ?? "";

  const [authReady, setAuthReady] = useState(false);
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [dj, setDj] = useState<DjProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [justConfirmed, setJustConfirmed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        router.replace(
          `/auth?returnTo=${encodeURIComponent(`/betalen/${bookingId}`)}`,
        );
        return;
      }
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
  const hours =
    typeof booking?.hours === "number"
      ? booking.hours
      : typeof booking?.hours === "string"
        ? parseInt(booking.hours, 10) || 0
        : 0;
  const location =
    typeof booking?.location === "string" ? booking.location : "—";
  const startTime =
    typeof booking?.start_time === "string" ? booking.start_time : "";

  const djLine =
    typeof booking?.dj_line_total === "number"
      ? booking.dj_line_total
      : typeof booking?.dj_line_total === "string"
        ? parseFloat(booking.dj_line_total)
        : 0;
  const travel =
    typeof booking?.travel_cost === "number"
      ? booking.travel_cost
      : typeof booking?.travel_cost === "string"
        ? parseFloat(booking.travel_cost)
        : 0;
  const total =
    typeof booking?.total_amount === "number"
      ? booking.total_amount
      : typeof booking?.total_amount === "string"
        ? parseFloat(booking.total_amount)
        : djLine + travel;

  const handleConfirm = useCallback(async () => {
    if (!bookingId || !booking) return;
    setSubmitError(null);
    setSubmitting(true);

    const { error } = await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId);

    setSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    setJustConfirmed(true);
  }, [bookingId, booking]);

  const alreadyConfirmed =
    booking != null &&
    typeof booking.status === "string" &&
    booking.status === "confirmed";
  const confirmed = justConfirmed || alreadyConfirmed;

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-sans">
        <p className="text-neutral-600">Laden…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-sans">
        <p className="text-neutral-600">Boeking laden…</p>
      </div>
    );
  }

  if (loadError || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 font-sans text-center">
        <p className="text-neutral-800">{loadError ?? "Boeking niet gevonden."}</p>
        <Link href="/dashboard/klant" className="mt-4 text-sm font-semibold underline">
          Naar dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            bookadj
          </Link>
          <Link
            href="/dashboard/klant"
            className="text-sm font-medium text-white/90 hover:text-white"
          >
            Mijn boekingen
          </Link>
        </div>
      </header>

      {/* Progress — stap 2 actief */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <ol className="flex items-center justify-between gap-2 text-xs font-semibold sm:text-sm">
            <li className="flex flex-1 flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white sm:h-10 sm:w-10">
                ✓
              </span>
              <span className="text-center text-neutral-600 sm:text-left">
                Evenementdetails
              </span>
            </li>
            <div className="hidden h-px flex-1 bg-neutral-300 sm:block" />
            <li className="flex flex-1 flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white sm:h-10 sm:w-10">
                2
              </span>
              <span className="text-center text-neutral-900 sm:text-left">
                Betaling
              </span>
            </li>
            <div className="hidden h-px flex-1 bg-neutral-300 sm:block" />
            <li className="flex flex-1 flex-col items-center gap-2 opacity-50 sm:flex-row sm:justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-neutral-300 bg-white text-neutral-500 sm:h-10 sm:w-10">
                3
              </span>
              <span className="text-center sm:text-left">Bevestiging</span>
            </li>
          </ol>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px] lg:items-start lg:gap-12">
        <div className="space-y-8">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">Jouw boeking</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">DJ</dt>
                <dd className="font-medium text-neutral-900">{djName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Datum</dt>
                <dd className="font-medium text-neutral-900 text-right">
                  {formatEventDate(eventDate)}
                </dd>
              </div>
              {startTime ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Starttijd</dt>
                  <dd className="font-medium text-neutral-900">{startTime}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Duur</dt>
                <dd className="font-medium text-neutral-900">{hours} uur</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Locatie</dt>
                <dd className="max-w-[60%] text-right font-medium text-neutral-900">
                  {location}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-neutral-100 pt-3">
                <dt className="font-semibold text-neutral-900">Totaal</dt>
                <dd className="text-lg font-bold text-neutral-900">
                  €{total.toLocaleString("nl-NL")}
                </dd>
              </div>
            </dl>
          </section>

          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950 ring-1 ring-emerald-200">
            Je betaling wordt vastgezet (hold): er wordt nog niets definitief
            afgeschreven tot de DJ je boeking accepteert. Daarna wordt het bedrag
            volgens de afspraken verwerkt.
          </div>

          {confirmed ? (
            <div
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center"
              role="status"
            >
              <p className="text-xl font-bold text-emerald-950">
                Boeking bevestigd
              </p>
              <p className="mt-2 text-sm text-emerald-900">
                Je aanvraag staat klaar. De DJ ontvangt een seintje — je hoort
                snel van ons.
              </p>
              <Link
                href="/dashboard/klant"
                className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-900"
              >
                Naar mijn boekingen
              </Link>
            </div>
          ) : (
            <>
              <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900">
                  Betaalgegevens
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Demovelden — echte Stripe-integratie volgt.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    { label: "VISA", className: "bg-[#1a1f71] text-white" },
                    { label: "MC", className: "bg-neutral-900 text-white" },
                    { label: "iDEAL", className: "bg-[#CC0066] text-white" },
                  ].map((b) => (
                    <span
                      key={b.label}
                      className={`rounded px-3 py-1 text-xs font-bold ${b.className}`}
                    >
                      {b.label}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 rounded border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700">
                    🔒 Stripe
                  </span>
                </div>

                {submitError ? (
                  <p
                    className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                    role="alert"
                  >
                    {submitError}
                  </p>
                ) : null}

                <div className="mt-6 space-y-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-neutral-800">
                      Kaartnummer
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-semibold text-neutral-800">
                        Vervaldatum
                      </span>
                      <input
                        type="text"
                        placeholder="MM / JJ"
                        autoComplete="cc-exp"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-neutral-800">
                        CVV
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-sm font-semibold text-neutral-800">
                      Naam op kaart
                    </span>
                    <input
                      type="text"
                      autoComplete="cc-name"
                      placeholder="Zoals op de kaart"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                    />
                  </label>
                </div>
              </section>

              <ul className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    t: "Versleuteld",
                    d: "Verbinding via TLS; gegevens worden niet op onze servers opgeslagen (met Stripe).",
                  },
                  {
                    t: "Nog geen charge",
                    d: "Geen definitieve afschrijving tot de DJ je boeking accepteert.",
                  },
                  {
                    t: "Restitutie",
                    d: "Annulering en terugbetaling volgens onze voorwaarden en het moment van annuleren.",
                  },
                ].map((x) => (
                  <li
                    key={x.t}
                    className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm"
                  >
                    <p className="font-semibold text-neutral-900">{x.t}</p>
                    <p className="mt-1 text-neutral-600">{x.d}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">Overzicht</h2>

            <div className="mt-4 flex gap-3 rounded-xl bg-neutral-50 p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                {initials(djName)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-neutral-900">{djName}</p>
                <p className="text-xs text-neutral-500">
                  {formatEventDate(eventDate)}
                  {startTime ? ` · ${startTime}` : ""} · {hours} uur
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-neutral-100 pt-5 text-sm">
              <div className="flex justify-between text-neutral-700">
                <span>DJ</span>
                <span className="font-medium">
                  €{djLine.toLocaleString("nl-NL")}
                </span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>Apparatuur</span>
                <span className="font-medium text-emerald-700">Inbegrepen</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>Reiskosten</span>
                <span className="font-medium">
                  €{travel.toLocaleString("nl-NL")}
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-neutral-900">
                <span>Totaal</span>
                <span>€{total.toLocaleString("nl-NL")}</span>
              </div>
            </div>

            {!confirmed ? (
              <>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="mt-6 w-full rounded-xl bg-black py-3.5 text-sm font-bold text-white hover:bg-neutral-900 disabled:opacity-50"
                >
                  {submitting ? "Bezig…" : "Bevestig boeking"}
                </button>
                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
                  <span aria-hidden className="text-base">
                    🔒
                  </span>
                  Beveiligd via Stripe
                </p>
              </>
            ) : (
              <p className="mt-6 text-center text-sm font-medium text-emerald-800">
                Boeking is bevestigd.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
