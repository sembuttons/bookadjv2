"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { Navbar } from "@/components/Navbar";
import { DatePickerPopover } from "@/components/date-picker-popover";
import { TimePickerPopover } from "@/components/time-picker-popover";
import {
  getCity,
  getDisplayName,
  getGenres,
  getHourlyRate,
  type DjProfileRow,
} from "@/lib/dj-profile-helpers";
import { supabase } from "@/lib/supabase-browser";

const EVENT_TYPES = [
  "Verjaardagsfeest",
  "Bruiloft",
  "Bedrijfsfeest",
  "Huisfeest",
  "Festival",
  "Anders",
] as const;

const libraries = ["places"] as const;

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

function parseUrlDateParam(s: string | null): string {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return "";
  const d = new Date(`${s}T12:00:00`);
  return Number.isNaN(d.getTime()) ? "" : s;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function BoekenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const djIdRaw = params.djId;
  const djId = typeof djIdRaw === "string" ? djIdRaw : djIdRaw?.[0] ?? "";

  const boekenPathWithQuery = useMemo(() => {
    const q = searchParams.toString();
    return q ? `/boeken/${djId}?${q}` : `/boeken/${djId}`;
  }, [djId, searchParams]);

  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [profile, setProfile] = useState<DjProfileRow | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [eventDate, setEventDate] = useState("");
  const [hours, setHours] = useState(4);
  const [startTime, setStartTime] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [travelCost, setTravelCost] = useState(0);
  const [travelDistance, setTravelDistance] = useState(0);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [eventType, setEventType] = useState<string>(EVENT_TYPES[0]);
  const [customerMessage, setCustomerMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [blockedIsoDates, setBlockedIsoDates] = useState<string[]>([]);

  useEffect(() => {
    const fromUrl = parseUrlDateParam(searchParams.get("date"));
    if (fromUrl) setEventDate(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        router.replace(
          `/auth?redirect=${encodeURIComponent(boekenPathWithQuery)}`,
        );
        return;
      }
      setUserId(session.user.id);
      setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router, boekenPathWithQuery]);

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

  useEffect(() => {
    if (!djId) return;
    let cancelled = false;
    void (async () => {
      const { data, error: be } = await supabase
        .from("dj_availability")
        .select("blocked_date")
        .eq("dj_id", djId);
      if (cancelled) return;
      if (be || !data) {
        setBlockedIsoDates([]);
        return;
      }
      const list = data
        .map((r) => (r as { blocked_date?: string }).blocked_date)
        .filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d));
      setBlockedIsoDates(list);
    })();
    return () => {
      cancelled = true;
    };
  }, [djId]);

  const hourlyRate = profile ? getHourlyRate(profile) ?? 125 : 125;
  const djName = profile ? getDisplayName(profile) : "…";
  const city = profile ? getCity(profile) : "-";
  const genres = profile ? getGenres(profile) : [];

  const djCostEuro = useMemo(
    () => Math.round(hourlyRate * hours * 100) / 100,
    [hourlyRate, hours],
  );

  const estimatedTotalEuro = useMemo(
    () => Math.round((djCostEuro + travelCost) * 100) / 100,
    [djCostEuro, travelCost],
  );

  const blockedSet = useMemo(
    () => new Set(blockedIsoDates),
    [blockedIsoDates],
  );

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
    libraries: libraries as any,
  });

  const onPlaceChanged = useCallback(() => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    const formatted = place?.formatted_address ?? place?.name ?? "";
    if (formatted) setVenueAddress(formatted);

    const loc = place?.geometry?.location;
    if (!loc) return;
    const lat = typeof loc.lat === "function" ? loc.lat() : null;
    const lng = typeof loc.lng === "function" ? loc.lng() : null;
    if (lat == null || lng == null) return;

    const homeLat =
      profile && typeof (profile as any).home_lat === "number"
        ? ((profile as any).home_lat as number)
        : null;
    const homeLng =
      profile && typeof (profile as any).home_lng === "number"
        ? ((profile as any).home_lng as number)
        : null;
    const perKm =
      profile && typeof (profile as any).rate_per_km === "number"
        ? (((profile as any).rate_per_km as number) > 0
            ? ((profile as any).rate_per_km as number)
            : 0.42)
        : 0.42;

    if (homeLat != null && homeLng != null) {
      const crow = haversineKm(homeLat, homeLng, lat, lng);
      const roadReturnTrip = crow * 1.3 * 2;
      const kmRounded = Math.round(roadReturnTrip);
      const cost = Math.round(roadReturnTrip * perKm);
      setTravelDistance(kmRounded);
      setTravelCost(cost);
    } else {
      setTravelDistance(0);
      setTravelCost(0);
    }
  }, [autocomplete, profile]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      const nextFieldErr: Record<string, string> = {};
      if (!eventDate.trim()) nextFieldErr.eventDate = "Dit veld is verplicht";
      else if (blockedSet.has(eventDate.trim())) {
        nextFieldErr.eventDate =
          "Deze datum is niet beschikbaar. Kies een andere dag.";
      }
      if (!startTime.trim()) nextFieldErr.startTime = "Dit veld is verplicht";
      if (!venueAddress.trim()) nextFieldErr.venueAddress = "Dit veld is verplicht";
      setFieldErrors(nextFieldErr);
      if (Object.keys(nextFieldErr).length > 0) return;

      if (!userId || !djId || !profile) {
        setSubmitError("Sessie of DJ ontbreekt. Vernieuw de pagina.");
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

      if (error) {
        setSubmitting(false);
        setSubmitError(error.message);
        return;
      }

      const bookingId = data?.id;
      if (!bookingId) {
        setSubmitting(false);
        setSubmitError("Geen boeking-ID ontvangen.");
        return;
      }

      if (session.access_token) {
        try {
          await fetch("/api/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              type: "booking_requested",
              bookingId,
            }),
          });
        } catch {
          /* e-mailfout blokkeert doorsturen niet */
        }
        try {
          await fetch("/api/bookings/welcome-thread", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ bookingId }),
          });
        } catch {
          /* welkomstbericht optioneel */
        }
      }

      setSubmitting(false);
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
      blockedSet,
    ],
  );

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 font-sans">
        <p className="text-gray-500">Laden…</p>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 font-sans">
        <p className="text-gray-500">DJ-profiel laden…</p>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 font-sans text-center">
        <p className="text-gray-900 font-bold">{profileError ?? "DJ niet gevonden."}</p>
        <Link
          href="/zoeken"
          className="mt-4 text-sm font-semibold text-green-600 hover:text-green-700 underline underline-offset-4"
        >
          Terug naar zoeken
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Link
            href="/zoeken"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            DJ&apos;s
          </Link>
          <Link
            href={`/dj/${encodeURIComponent(djId)}`}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Terug naar profiel
          </Link>
        </div>

        <ol className="flex items-center justify-between gap-2 text-xs font-semibold sm:text-sm">
          <li className="flex flex-1 flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-black font-bold sm:h-10 sm:w-10">
              1
            </span>
            <span className="text-center text-green-600 sm:text-left">
              Evenementdetails
            </span>
          </li>
          <div className="hidden h-px flex-1 bg-gray-200 sm:block" />
          <li className="flex flex-1 flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400 sm:h-10 sm:w-10">
              2
            </span>
            <span className="text-center text-gray-400 sm:text-left">
              Betaling
            </span>
          </li>
          <div className="hidden h-px flex-1 bg-gray-200 sm:block" />
          <li className="flex flex-1 flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400 sm:h-10 sm:w-10">
              3
            </span>
            <span className="text-center text-gray-400 sm:text-left">
              Bevestiging
            </span>
          </li>
        </ol>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px] lg:items-start lg:gap-12">
        <div>
          <form
            id="boeking-form"
            noValidate
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                {initials(djName)}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-gray-900">{djName}</p>
                <p className="text-sm text-gray-500">
                  {genres.slice(0, 3).join(" · ") || "DJ"}
                  {" · "}
                  {city}
                </p>
              </div>
            </div>

            {submitError ? (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-500"
                role="alert"
              >
                {submitError}
              </p>
            ) : null}

            <div className="space-y-6">
              <div className="block">
                <DatePickerPopover
                  value={eventDate}
                  onChange={(v) => {
                    setEventDate(v);
                    setFieldErrors((p) => {
                      const n = { ...p };
                      delete n.eventDate;
                      return n;
                    });
                  }}
                  label="Evenementdatum"
                  placeholder="Kies een datum"
                  triggerClassName="flex w-full items-center rounded-xl bg-white border border-gray-200 px-4 py-3 text-left text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  popoverAlign="left"
                  blockedIsoDates={blockedIsoDates}
                />
                {fieldErrors.eventDate ? (
                  <p className="mt-1.5 text-sm text-red-500" role="alert">
                    {fieldErrors.eventDate}
                  </p>
                ) : null}
              </div>

              <div>
                <span className="text-gray-700 text-sm font-medium">
                  Aantal uren
                </span>
                <div className="mt-2 flex flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHours(h)}
                      className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                        hours === h
                          ? "bg-green-500 text-black font-bold border-green-500"
                          : "bg-gray-100 text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50"
                      }`}
                    >
                      {h} uur
                    </button>
                  ))}
                </div>
              </div>

              <div className="block">
                <TimePickerPopover
                  value={startTime}
                  onChange={(v) => {
                    setStartTime(v);
                    setFieldErrors((p) => {
                      const n = { ...p };
                      delete n.startTime;
                      return n;
                    });
                  }}
                  label="Starttijd"
                  placeholder="Kies een tijd"
                  triggerClassName="flex w-full items-center rounded-xl bg-white border border-gray-200 px-4 py-3 text-left text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  popoverAlign="left"
                />
                {fieldErrors.startTime ? (
                  <p className="mt-1.5 text-sm text-red-500" role="alert">
                    {fieldErrors.startTime}
                  </p>
                ) : null}
              </div>

              <label className="block">
                <span className="text-gray-700 text-sm font-medium">
                  Locatie evenement
                </span>
                <div className="relative mt-2">
                  <div
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    aria-hidden
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="11"
                        r="2.25"
                        stroke="currentColor"
                        strokeWidth="1.75"
                      />
                    </svg>
                  </div>
                  {isLoaded ? (
                    <Autocomplete
                      onLoad={(ac) => setAutocomplete(ac)}
                      onPlaceChanged={onPlaceChanged}
                      options={{ componentRestrictions: { country: "nl" } }}
                    >
                      <input
                        type="text"
                        value={venueAddress}
                        onChange={(e) => {
                          setVenueAddress(e.target.value);
                          setFieldErrors((p) => {
                            const n = { ...p };
                            delete n.venueAddress;
                            return n;
                          });
                        }}
                        placeholder="Straat en huisnummer, Stad"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pl-10 text-gray-900 text-sm outline-none placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      />
                    </Autocomplete>
                  ) : (
                    <input
                      type="text"
                      placeholder="Adres laden..."
                      disabled
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pl-10 text-gray-900 text-sm"
                    />
                  )}
                </div>
                {travelCost > 0 ? (
                  <div className="mt-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-500">
                    <span className="font-semibold text-gray-900">
                      Reiskosten: €{travelCost}
                    </span>{" "}
                    <span className="text-gray-500">
                      (geschatte afstand: {travelDistance}km retour)
                    </span>
                  </div>
                ) : venueAddress.trim() ? (
                  <p className="mt-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-xs italic text-gray-500">
                    Selecteer een adres uit de lijst om reiskosten te berekenen.
                  </p>
                ) : null}
                {fieldErrors.venueAddress ? (
                  <p className="mt-1.5 text-sm text-red-500" role="alert">
                    {fieldErrors.venueAddress}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className="text-gray-700 text-sm font-medium">
                  Type evenement
                </span>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="mt-2 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-gray-700 text-sm font-medium">
                  Bericht aan DJ{" "}
                  <span className="font-normal text-gray-500 text-sm">
                    (optioneel)
                  </span>
                </span>
                <textarea
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  rows={4}
                  placeholder="Bijv. sfeer, verzoeknummers, planning…"
                  className="mt-2 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                />
              </label>
            </div>

            <div className="lg:hidden">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-500 hover:bg-green-400 text-black font-bold w-full rounded-xl py-4 text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-black border-r-transparent"
                      aria-hidden
                    />
                    Bezig met verzenden…
                  </>
                ) : (
                  "Boeking aanvragen"
                )}
              </button>
              <p className="mt-3 text-gray-400 text-xs text-center">
                Veilig betalen via bookadj - je wordt pas in rekening gebracht na acceptatie
              </p>
            </div>
          </form>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900">Samenvatting</h2>

            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-gray-900">{djName}</p>
                <p className="font-bold text-green-600">
                  €{hourlyRate.toLocaleString("nl-NL")}/uur
                </p>
              </div>
              <ul className="mt-3 space-y-1 text-gray-600">
                <li>
                  Datum:{" "}
                  <span className="font-semibold text-gray-900">
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
                      : "-"}
                  </span>
                </li>
                <li>
                  Start:{" "}
                  <span className="font-semibold text-gray-900">
                    {startTime || "-"}
                  </span>
                </li>
                <li>
                  Duur:{" "}
                  <span className="font-semibold text-gray-900">
                    {hours} uur
                  </span>
                </li>
                <li>
                  Locatie:{" "}
                  <span className="font-semibold text-gray-900">
                    {venueAddress.trim() || "-"}
                  </span>
                </li>
                <li>
                  Type:{" "}
                  <span className="font-semibold text-gray-900">
                    {eventType}
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-5 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Prijsopbouw (indicatie)
              </p>
              <div className="mt-3 flex justify-between text-gray-600">
                <span>
                  Uurtarief × uren ({hours} × €{hourlyRate.toLocaleString("nl-NL")})
                </span>
                <span className="font-semibold text-gray-900">
                  €{djCostEuro.toLocaleString("nl-NL")}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Reiskosten (indicatie)</span>
                <span className="font-semibold text-gray-900">
                  {travelCost > 0
                    ? `€${travelCost.toLocaleString("nl-NL")}`
                    : "€0"}
                </span>
              </div>
              <div className="mt-3 border-t border-gray-200 pt-3 flex justify-between text-xl font-black text-gray-900">
                <span>Totaal (indicatie)</span>
                <span>€{estimatedTotalEuro.toLocaleString("nl-NL")}</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Het uurtarief wordt vastgelegd bij je aanvraag. Reiskosten kunnen door de DJ worden
                bevestigd.
              </p>
            </div>

            <button
              type="submit"
              form="boeking-form"
              disabled={submitting}
              className="mt-6 hidden bg-green-500 hover:bg-green-400 text-black font-bold w-full rounded-xl py-4 text-base transition-all disabled:opacity-50 lg:flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-black border-r-transparent"
                    aria-hidden
                  />
                  Bezig met verzenden…
                </>
              ) : (
                "Boeking aanvragen"
              )}
            </button>

            <p className="mt-3 text-gray-400 text-xs text-center">
              Veilig betalen via bookadj - je wordt pas in rekening gebracht na acceptatie
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
