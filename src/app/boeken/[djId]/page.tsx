"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCity,
  getDisplayName,
  getGenres,
  getHourlyRate,
  type DjProfileRow,
} from "@/lib/dj-profile-helpers";
import { supabase } from "@/lib/supabase";

const EVENT_TYPES = [
  "Verjaardagsfeest",
  "Bruiloft",
  "Bedrijfsfeest",
  "Huisfeest",
  "Festival",
  "Anders",
] as const;

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "DJ"
  );
}

function randomReference() {
  return `BKA-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function BoekenPage() {
  const router = useRouter();
  const params = useParams();
  const djIdRaw = params.djId;
  const djId = typeof djIdRaw === "string" ? djIdRaw : djIdRaw?.[0] ?? "";

  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [profile, setProfile] = useState<DjProfileRow | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [eventDate, setEventDate] = useState("");
  const [hours, setHours] = useState(4);
  const [startTime, setStartTime] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [eventType, setEventType] = useState<string>(EVENT_TYPES[0]);
  const [customerMessage, setCustomerMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        router.replace(
          `/auth?returnTo=${encodeURIComponent(`/boeken/${djId}`)}`,
        );
        return;
      }
      setUserId(session.user.id);
      setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router, djId]);

  useEffect(() => {
    if (!authReady || !djId) return;
    let cancelled = false;
    (async () => {
      setProfileLoading(true);
      setProfileError(null);
      const { data, error } = await supabase
        .from("dj_profiles")
        .select("*")
        .eq("id", djId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setProfileError(error.message);
        setProfile(null);
      } else if (!data) {
        setProfileError("DJ niet gevonden.");
        setProfile(null);
      } else {
        setProfile(data as DjProfileRow);
      }
      setProfileLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, djId]);

  const hourlyRate = profile ? getHourlyRate(profile) ?? 125 : 125;
  const djName = profile ? getDisplayName(profile) : "…";
  const city = profile ? getCity(profile) : "—";
  const genres = profile ? getGenres(profile) : [];

  const djCostEuro = useMemo(
    () => Math.round(hourlyRate * hours * 100) / 100,
    [hourlyRate, hours],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      if (!userId || !djId || !profile) {
        setSubmitError("Sessie of DJ ontbreekt. Vernieuw de pagina.");
        return;
      }
      if (!eventDate.trim()) {
        setSubmitError("Kies een evenementdatum.");
        return;
      }
      if (!startTime.trim()) {
        setSubmitError("Kies een starttijd.");
        return;
      }
      if (!venueAddress.trim()) {
        setSubmitError("Vul de locatie in.");
        return;
      }

      const totalAmountCents = Math.round(hours * hourlyRate * 100);
      const platformFeeCents = Math.round(totalAmountCents * 0.15);
      const djPayoutCents = totalAmountCents - platformFeeCents;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      setSubmitting(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        setSubmitting(false);
        setSubmitError("Sessie verlopen. Log opnieuw in.");
        return;
      }

      const sessionUserId = session.user.id;
      const userEmail = session.user.email;
      if (!userEmail) {
        setSubmitting(false);
        setSubmitError(
          "Geen e-mailadres op je account. Vul dit aan en probeer opnieuw.",
        );
        return;
      }

      const { error: upsertUserError } = await supabase.from("users").upsert(
        {
          id: sessionUserId,
          email: userEmail,
          full_name: session.user.user_metadata?.full_name || "",
          role: session.user.user_metadata?.role || "customer",
        },
        { onConflict: "id" },
      );

      if (upsertUserError) {
        setSubmitting(false);
        setSubmitError(upsertUserError.message);
        return;
      }

      const payload = {
        reference: randomReference(),
        customer_id: sessionUserId,
        dj_id: djId,
        status: "pending",
        event_date: eventDate,
        start_time: startTime,
        hours,
        venue_address: venueAddress.trim(),
        event_type: eventType,
        customer_message: customerMessage.trim() || null,
        hourly_rate_snapshot: hourlyRate,
        total_amount: totalAmountCents,
        platform_fee: platformFeeCents,
        dj_payout: djPayoutCents,
        expires_at: expiresAt,
      };

      const { data, error } = await supabase
        .from("bookings")
        .insert(payload)
        .select("id")
        .single();

      setSubmitting(false);

      if (error) {
        setSubmitError(error.message);
        return;
      }

      const bookingId = data?.id;
      if (!bookingId) {
        setSubmitError("Geen boeking-ID ontvangen.");
        return;
      }

      router.push(`/bevestiging/${bookingId}`);
      router.refresh();
    },
    [
      userId,
      djId,
      profile,
      eventDate,
      startTime,
      venueAddress,
      eventType,
      customerMessage,
      hours,
      hourlyRate,
      router,
    ],
  );

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-sans">
        <p className="text-neutral-600">Laden…</p>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-sans">
        <p className="text-neutral-600">DJ-profiel laden…</p>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 font-sans text-center">
        <p className="text-neutral-800">{profileError ?? "DJ niet gevonden."}</p>
        <Link href="/zoeken" className="mt-4 text-sm font-semibold underline">
          Terug naar zoeken
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
            href={`/dj/${encodeURIComponent(djId)}`}
            className="text-sm font-medium text-white/90 hover:text-white"
          >
            Terug naar profiel
          </Link>
        </div>
      </header>

      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <ol className="flex items-center justify-between gap-2 text-xs font-semibold sm:text-sm">
            <li className="flex flex-1 flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white sm:h-10 sm:w-10">
                1
              </span>
              <span className="text-center text-neutral-900 sm:text-left">
                Evenementdetails
              </span>
            </li>
            <div className="hidden h-px flex-1 bg-neutral-300 sm:block" />
            <li className="flex flex-1 flex-col items-center gap-2 opacity-50 sm:flex-row sm:justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-neutral-300 bg-white text-neutral-500 sm:h-10 sm:w-10">
                2
              </span>
              <span className="text-center sm:text-left">Betaling</span>
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
        <div>
          <form
            id="boeking-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                {initials(djName)}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-neutral-900">{djName}</p>
                <p className="text-sm text-neutral-600">
                  {genres.slice(0, 3).join(" · ") || "DJ"}
                  {" · "}
                  {city}
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-900">
                  €{hourlyRate.toLocaleString("nl-NL")}/uur
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950 ring-1 ring-emerald-200">
              Geen betaling tot acceptatie — je kaart wordt pas belast wanneer de
              DJ je aanvraag accepteert.
            </div>

            {submitError ? (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {submitError}
              </p>
            ) : null}

            <div className="space-y-6">
              <label className="block">
                <span className="text-sm font-semibold text-neutral-800">
                  Evenementdatum
                </span>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                />
              </label>

              <div>
                <span className="text-sm font-semibold text-neutral-800">
                  Aantal uren
                </span>
                <div className="mt-2 flex flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHours(h)}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        hours === h
                          ? "bg-black text-emerald-400"
                          : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                      }`}
                    >
                      {h} uur
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-neutral-800">
                  Starttijd
                </span>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-neutral-800">
                  Locatie evenement
                </span>
                <input
                  type="text"
                  required
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder="Adres of plaats"
                  className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-neutral-800">
                  Type evenement
                </span>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-neutral-800">
                  Bericht aan DJ{" "}
                  <span className="font-normal text-neutral-500">
                    (optioneel)
                  </span>
                </span>
                <textarea
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  rows={4}
                  placeholder="Bijv. sfeer, verzoeknummers, planning…"
                  className="mt-2 w-full resize-y rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                />
              </label>
            </div>

            <div className="lg:hidden">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-black py-3.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {submitting ? "Bezig…" : "Boeking aanvragen"}
              </button>
            </div>
          </form>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">Samenvatting</h2>

            <div className="mt-4 rounded-xl bg-neutral-50 p-4 text-sm">
              <p className="font-semibold text-neutral-900">{djName}</p>
              <ul className="mt-2 space-y-1 text-neutral-600">
                <li>
                  Datum:{" "}
                  <span className="font-medium text-neutral-800">
                    {eventDate
                      ? new Date(eventDate + "T12:00:00").toLocaleDateString(
                          "nl-NL",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "—"}
                  </span>
                </li>
                <li>
                  Start:{" "}
                  <span className="font-medium text-neutral-800">
                    {startTime || "—"}
                  </span>
                </li>
                <li>
                  Duur:{" "}
                  <span className="font-medium text-neutral-800">
                    {hours} uur
                  </span>
                </li>
                <li>
                  Locatie:{" "}
                  <span className="font-medium text-neutral-800">
                    {venueAddress.trim() || "—"}
                  </span>
                </li>
                <li>
                  Type:{" "}
                  <span className="font-medium text-neutral-800">
                    {eventType}
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-5 space-y-2 border-t border-neutral-100 pt-5 text-sm">
              <div className="flex justify-between text-neutral-700">
                <span>
                  DJ ({hours} × €{hourlyRate.toLocaleString("nl-NL")})
                </span>
                <span className="font-medium">
                  €{djCostEuro.toLocaleString("nl-NL")}
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-neutral-900">
                <span>Totaal</span>
                <span>€{djCostEuro.toLocaleString("nl-NL")}</span>
              </div>
            </div>

            <button
              type="submit"
              form="boeking-form"
              disabled={submitting}
              className="mt-6 hidden w-full rounded-xl bg-black py-3.5 text-sm font-bold text-white hover:bg-neutral-900 disabled:opacity-50 lg:block"
            >
              {submitting ? "Bezig…" : "Boeking aanvragen"}
            </button>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
              <span aria-hidden className="text-base">
                🔒
              </span>
              Beveiligd via Stripe
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
