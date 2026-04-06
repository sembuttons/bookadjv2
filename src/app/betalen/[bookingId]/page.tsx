"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { PaymentIntent, StripeElementsOptions } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  getDisplayName,
  type DjProfileRow,
} from "@/lib/dj-profile-helpers";
import { supabase } from "@/lib/supabase-browser";

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

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

function formatEuroFromCents(cents: number | null | undefined): string {
  if (typeof cents !== "number" || Number.isNaN(cents)) return "€0";
  const euros = cents / 100;
  return `€${euros.toLocaleString("nl-NL", {
    minimumFractionDigits: Number.isInteger(euros) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function totalCents(booking: BookingRow | null): number {
  if (!booking) return 0;
  const t = booking.total_amount;
  if (typeof t === "number" && Number.isFinite(t)) return Math.round(t);
  if (typeof t === "string") {
    const n = parseFloat(t);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }
  return 0;
}

function PaymentForm({
  bookingId,
  onPaid,
  onError,
}: {
  bookingId: string;
  onPaid: (pi: PaymentIntent) => Promise<void>;
  onError: (msg: string | null) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setLocalError(null);
    onError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/betalen/${bookingId}`,
      },
      redirect: "if_required",
    });

    setProcessing(false);

    if (error) {
      const msg =
        error.message ?? "Betaling mislukt. Probeer het opnieuw of kies een andere betaalmethode.";
      setLocalError(msg);
      onError(msg);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      await onPaid(paymentIntent);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <PaymentElement />
      {localError ? (
        <p
          className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-400"
          role="alert"
        >
          {localError}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full rounded-xl bg-green-500 py-3.5 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-50"
      >
        {processing ? "Bezig met betalen…" : "Betaal nu"}
      </button>
    </form>
  );
}

export default function BetalenPage() {
  const router = useRouter();
  const params = useParams();
  const bookingIdRaw = params.bookingId;
  const bookingId =
    typeof bookingIdRaw === "string" ? bookingIdRaw : bookingIdRaw?.[0] ?? "";

  const [authReady, setAuthReady] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [dj, setDj] = useState<DjProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [piLoading, setPiLoading] = useState(false);
  const [piError, setPiError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [returnClientSecret, setReturnClientSecret] = useState<string | null>(
    null,
  );

  const finalizingRef = useRef(false);
  const returnRetrieveStartedRef = useRef(false);

  const finalizePayment = useCallback(
    async (paymentIntent: PaymentIntent) => {
      if (finalizingRef.current) return;
      finalizingRef.current = true;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        setSubmitError("Sessie verlopen. Log opnieuw in.");
        finalizingRef.current = false;
        return;
      }

      const uid = session.user.id;

      const { error: u1 } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId)
        .eq("status", "pending")
        .or(`customer_id.eq.${uid},user_id.eq.${uid}`);

      if (u1) {
        setSubmitError(u1.message);
        finalizingRef.current = false;
        return;
      }

      const { data: existingPay } = await supabase
        .from("payments")
        .select("id")
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .maybeSingle();

      if (!existingPay) {
        const { error: u2 } = await supabase.from("payments").insert({
          booking_id: bookingId,
          stripe_payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        });
        if (u2) {
          setSubmitError(u2.message);
          finalizingRef.current = false;
          return;
        }
      }

      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", `/betalen/${bookingId}`);
      }

      router.push(`/bevestiging/${bookingId}`);
      router.refresh();
    },
    [bookingId, router],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret",
    );
    if (s) setReturnClientSecret(s);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        router.replace(
          `/auth?redirect=${encodeURIComponent(`/betalen/${bookingId}`)}`,
        );
        return;
      }
      setSessionUserId(session.user.id);
      setAccessToken(session.access_token);
      setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router, bookingId]);

  useEffect(() => {
    if (!authReady || !bookingId || !sessionUserId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const { data: b, error: bErr } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .or(
          `customer_id.eq.${sessionUserId},user_id.eq.${sessionUserId}`,
        )
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
  }, [authReady, bookingId, sessionUserId]);

  useEffect(() => {
    if (
      !returnClientSecret ||
      !booking ||
      !stripePromise ||
      returnRetrieveStartedRef.current ||
      finalizingRef.current
    ) {
      return;
    }
    const st =
      typeof booking.status === "string"
        ? booking.status.toLowerCase()
        : "";
    if (st !== "pending") return;

    returnRetrieveStartedRef.current = true;
    let cancelled = false;
    setSubmitError(null);

    (async () => {
      const stripe = await stripePromise;
      if (!stripe || cancelled) return;
      const { paymentIntent } =
        await stripe.retrievePaymentIntent(returnClientSecret);
      if (cancelled) return;
      if (paymentIntent?.status === "succeeded") {
        await finalizePayment(paymentIntent);
      } else {
        setSubmitError(
          "Betaling is nog niet voltooid. Probeer het opnieuw of kies een andere methode.",
        );
        returnRetrieveStartedRef.current = false;
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", `/betalen/${bookingId}`);
        }
        setReturnClientSecret(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [returnClientSecret, booking, bookingId, finalizePayment]);

  useEffect(() => {
    if (
      !authReady ||
      !accessToken ||
      !bookingId ||
      !booking ||
      returnClientSecret
    ) {
      return;
    }
    const st =
      typeof booking.status === "string"
        ? booking.status.toLowerCase()
        : "";
    if (st !== "pending") return;
    if (!stripePublishableKey || !stripePromise) {
      setPiError("Stripe is niet geconfigureerd (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).");
      return;
    }

    let cancelled = false;
    setPiLoading(true);
    setPiError(null);

    (async () => {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ bookingId }),
      });
      const json = (await res.json()) as {
        clientSecret?: string;
        error?: string;
      };
      if (cancelled) return;
      setPiLoading(false);
      if (!res.ok) {
        setPiError(json.error ?? "Kon betaling niet starten.");
        return;
      }
      if (!json.clientSecret) {
        setPiError("Geen betalingsgegevens ontvangen.");
        return;
      }
      setClientSecret(json.clientSecret);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    authReady,
    accessToken,
    bookingId,
    booking,
    returnClientSecret,
  ]);

  const djName = dj ? getDisplayName(dj) : "DJ";
  const eventDate =
    typeof booking?.event_date === "string" ? booking.event_date : "";
  const hours =
    typeof booking?.hours === "number"
      ? booking.hours
      : typeof booking?.hours === "string"
        ? parseInt(booking.hours, 10) || 0
        : 0;
  const venue =
    typeof booking?.venue_address === "string" && booking.venue_address.trim()
      ? booking.venue_address.trim()
      : typeof booking?.location === "string"
        ? booking.location
        : "—";
  const startTime =
    typeof booking?.start_time === "string" ? booking.start_time : "";

  const cents = totalCents(booking);
  const totalDisplay = formatEuroFromCents(cents);

  const bookingStatus =
    typeof booking?.status === "string"
      ? booking.status.toLowerCase()
      : "";
  const alreadyConfirmed = bookingStatus === "confirmed";
  const canPay = bookingStatus === "pending";

  const elementsOptions: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance: { theme: "stripe" },
        locale: "nl",
      }
    : undefined;

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111827] font-sans">
        <p className="text-gray-400">Laden…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111827] font-sans">
        <p className="text-gray-400">Boeking laden…</p>
      </div>
    );
  }

  if (loadError || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#111827] px-4 font-sans text-center">
        <p className="text-white">{loadError ?? "Boeking niet gevonden."}</p>
        <Link href="/dashboard/klant" className="mt-4 text-sm font-semibold underline">
          Naar dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] font-sans text-white">
      <Navbar />

      <div className="border-b border-gray-800 bg-[#0f172a]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <ol className="flex items-center justify-between gap-2 text-xs font-semibold sm:text-sm">
            <li className="flex flex-1 flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-black font-bold sm:h-10 sm:w-10">
                ✓
              </span>
              <span className="text-center text-gray-400 sm:text-left">
                Evenementdetails
              </span>
            </li>
            <div className="hidden h-px flex-1 bg-gray-800/70 sm:block" />
            <li className="flex flex-1 flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-black font-bold sm:h-10 sm:w-10">
                2
              </span>
              <span className="text-center text-white sm:text-left">
                Betaling
              </span>
            </li>
            <div className="hidden h-px flex-1 bg-gray-800/70 sm:block" />
            <li className="flex flex-1 flex-col items-center gap-2 opacity-50 sm:flex-row sm:justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-800 bg-[#111827] text-gray-500 sm:h-10 sm:w-10">
                3
              </span>
              <span className="text-center sm:text-left">Bevestiging</span>
            </li>
          </ol>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px] lg:items-start lg:gap-12">
        <div className="space-y-8">
          <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm">
            <h2 className="text-lg font-bold text-white">Jouw boeking</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">DJ</dt>
                <dd className="font-medium text-white">{djName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Datum</dt>
                <dd className="font-medium text-white text-right">
                  {formatEventDate(eventDate)}
                </dd>
              </div>
              {startTime ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Starttijd</dt>
                  <dd className="font-medium text-white">{startTime}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Duur</dt>
                <dd className="font-medium text-white">{hours} uur</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Locatie</dt>
                <dd className="max-w-[60%] text-right font-medium text-white">
                  {venue}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-gray-800/60 pt-3">
                <dt className="font-semibold text-white">Totaal</dt>
                <dd className="text-lg font-bold text-white">
                  {totalDisplay}
                </dd>
              </div>
            </dl>
          </section>

          <div className="rounded-xl bg-[#052e16] px-4 py-3 text-sm font-medium text-green-400 ring-1 ring-green-800/40">
            Betaling verloopt veilig via Stripe. Na een geslaagde betaling wordt
            je boeking bevestigd en ga je door naar de bevestigingspagina.
          </div>

          {alreadyConfirmed ? (
            <div
              className="rounded-2xl border border-green-800/40 bg-[#052e16] px-6 py-8 text-center"
              role="status"
            >
              <p className="text-xl font-bold text-green-400">
                Boeking al bevestigd
              </p>
              <p className="mt-2 text-sm text-green-400">
                Deze boeking is betaald en bevestigd.
              </p>
              <Link
                href={`/bevestiging/${encodeURIComponent(bookingId)}`}
                className="mt-6 inline-flex rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-black hover:bg-green-400"
              >
                Naar bevestiging
              </Link>
            </div>
          ) : canPay ? (
            <>
              <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm">
                <h2 className="text-lg font-bold text-white">Betalen</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Kies je betaalmethode en rond de betaling af.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded border border-gray-800 bg-[#0f172a] px-3 py-1 text-xs font-semibold text-gray-400">
                    🔒 Stripe
                  </span>
                </div>

                {submitError ? (
                  <p
                    className="mt-4 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                    role="alert"
                  >
                    {submitError}
                  </p>
                ) : null}

                <div className="mt-6">
                  {returnClientSecret &&
                  !clientSecret &&
                  !piError &&
                  !submitError ? (
                    <p className="text-sm text-gray-400">
                      Betaling controleren…
                    </p>
                  ) : piError ? (
                    <p
                      className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                      role="alert"
                    >
                      {piError}
                    </p>
                  ) : piLoading || !clientSecret ? (
                    <p className="text-sm text-gray-400">
                      Betaling voorbereiden…
                    </p>
                  ) : stripePromise && elementsOptions?.clientSecret ? (
                    <Elements
                      stripe={stripePromise}
                      options={elementsOptions}
                    >
                      <PaymentForm
                        bookingId={bookingId}
                        onPaid={finalizePayment}
                        onError={setSubmitError}
                      />
                    </Elements>
                  ) : null}
                </div>
              </section>

              <ul className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    t: "Versleuteld",
                    d: "Je betaalgegevens worden door Stripe verwerkt; wij slaan kaartgegevens niet op.",
                  },
                  {
                    t: "Direct bevestigen",
                    d: "Na een geslaagde betaling wordt je boeking op bevestigd gezet.",
                  },
                  {
                    t: "Support",
                    d: "Problemen met betalen? Neem contact op met support.",
                  },
                ].map((x) => (
                  <li
                    key={x.t}
                    className="rounded-xl border border-gray-800 bg-[#0f172a] p-4 text-sm"
                  >
                    <p className="font-semibold text-white">{x.t}</p>
                    <p className="mt-1 text-gray-400">{x.d}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
              <p className="font-semibold text-amber-400">
                Deze boeking kan niet worden betaald.
              </p>
              <p className="mt-2 text-sm text-amber-900">
                Status: {bookingStatus || "—"}
              </p>
              <Link
                href="/dashboard/klant"
                className="mt-6 inline-flex rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-black hover:bg-green-400"
              >
                Naar mijn boekingen
              </Link>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm">
            <h2 className="text-lg font-bold text-white">Overzicht</h2>

            <div className="mt-4 flex gap-3 rounded-xl bg-[#0f172a] p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111827] text-xs font-bold text-white">
                {initials(djName)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white">{djName}</p>
                <p className="text-xs text-gray-500">
                  {formatEventDate(eventDate)}
                  {startTime ? ` · ${startTime}` : ""} · {hours} uur
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-gray-800/60 pt-5 text-sm">
              <div className="flex justify-between border-t border-gray-800 pt-2 text-base font-bold text-white">
                <span>Totaal</span>
                <span>{totalDisplay}</span>
              </div>
            </div>

            {canPay ? (
              <p className="mt-6 text-center text-xs text-gray-500">
                Voltooi de betaling in het formulier links.
              </p>
            ) : alreadyConfirmed ? (
              <p className="mt-6 text-center text-sm font-medium text-green-400">
                Boeking is bevestigd.
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
