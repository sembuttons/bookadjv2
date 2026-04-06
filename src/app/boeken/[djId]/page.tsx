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
  const city = profile ? getCity(profile) : "—";
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
      <div className="flex min-h-screen items-center justify-center bg-surface font-sans">
        <p className="text-ink-secondary">Laden…</p>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface font-sans">
        <p className="text-ink-secondary">DJ-profiel laden…</p>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 font-sans text-center">
        <p className="text-ink">{profileError ?? "DJ niet gevonden."}</p>
        <Link href="/zoeken" className="mt-4 text-sm font-semibold underline">
          Terug naar zoeken
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <Navbar />
      <div className="border-b border-line bg-surface-muted">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="mb-4 flex justify-end">
            <Link
              href={`/dj/${encodeURIComponent(djId)}`}
              className="text-sm font-medium text-ink-secondary hover:text-ink"
            >
              Terug naar profiel
            </Link>
          </div>
          <ol className="flex items-center justify-between gap-2 text-xs font-semibold sm:text-sm">
            <li className="flex flex-1 flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bookadj text-white sm:h-10 sm:w-10">
                1
              </span>
              <span className="text-center text-ink sm:text-left">
                Evenementdetails
              </span>
            </li>
            <div className="hidden h-px flex-1 bg-line/70 sm:block" />
            <li className="flex flex-1 flex-col items-center gap-2 opacity-50 sm:flex-row sm:justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-line bg-surface text-ink-muted sm:h-10 sm:w-10">
                2
              </span>
              <span className="text-center sm:text-left">Betaling</span>
            </li>
            <div className="hidden h-px flex-1 bg-line/70 sm:block" />
            <li className="flex flex-1 flex-col items-center gap-2 opacity-50 sm:flex-row sm:justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-line bg-surface text-ink-muted sm:h-10 sm:w-10">
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
            noValidate
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="flex gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-bold text-white">
                {initials(djName)}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-ink">{djName}</p>
                <p className="text-sm text-ink-secondary">
                  {genres.slice(0, 3).join(" · ") || "DJ"}
                  {" · "}
                  {city}
                </p>
                <p className="mt-1 text-base font-bold text-bookadj sm:text-lg">
                  v.a. €{hourlyRate.toLocaleString("nl-NL")} per uur
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-bookadj-subtle px-4 py-3 text-sm font-medium text-bookadj-soft ring-1 ring-line-brand/40">
              <p>
                Geen betaling tot acceptatie — je kaart wordt pas belast wanneer de DJ je
                aanvraag accepteert.
              </p>
              <p className="mt-2 text-bookadj-soft/90">
                Je wordt pas in rekening gebracht na acceptatie. Geen acceptatie binnen de
                termijn? Dan betaal je niets.
              </p>
            </div>

            {submitError ? (
              <p
                className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger"
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
                  triggerClassName="flex h-[42px] w-full items-center rounded-lg border border-line bg-surface px-3 py-2.5 text-left text-sm text-ink outline-none focus:border-line-brand focus:ring-2 focus:ring-bookadj/25"
                  popoverAlign="left"
                  blockedIsoDates={blockedIsoDates}
                />
                {fieldErrors.eventDate ? (
                  <p className="mt-1.5 text-sm text-danger" role="alert">
                    {fieldErrors.eventDate}
                  </p>
                ) : null}
              </div>

              <div>
                <span className="text-sm font-semibold text-ink">
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
                          ? "bg-bookadj-subtle text-bookadj-soft ring-1 ring-line-brand"
                          : "bg-surface-muted/80 text-ink hover:bg-line/50"
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
                  triggerClassName="flex h-[42px] w-full items-center rounded-lg border border-line bg-surface px-3 py-2.5 text-left text-sm text-ink outline-none focus:border-line-brand focus:ring-2 focus:ring-bookadj/25"
                  popoverAlign="left"
                />
                {fieldErrors.startTime ? (
                  <p className="mt-1.5 text-sm text-danger" role="alert">
                    {fieldErrors.startTime}
                  </p>
                ) : null}
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-ink">
                  Locatie evenement
                </span>
                <div className="relative mt-2">
                  <div
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
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
                        className="h-[42px] w-full rounded-lg border border-line bg-surface pl-10 pr-3 text-sm outline-none placeholder:text-ink-muted focus:border-line-brand focus:ring-2 focus:ring-bookadj/25"
                      />
                    </Autocomplete>
                  ) : (
                    <input
                      type="text"
                      placeholder="Adres laden..."
                      disabled
                      className="h-[42px] w-full rounded-lg border border-line bg-surface pl-10 pr-3 text-sm"
                    />
                  )}
                </div>
                {travelCost > 0 ? (
                  <div className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-xs text-ink-secondary ring-1 ring-line">
                    <span className="font-semibold text-ink">
                      Reiskosten: €{travelCost}
                    </span>{" "}
                    <span className="text-ink-secondary">
                      (geschatte afstand: {travelDistance}km retour)
                    </span>
                  </div>
                ) : venueAddress.trim() ? (
                  <p className="mt-2 rounded-lg bg-surface-muted/80 px-3 py-2 text-xs italic text-ink-secondary">
                    Selecteer een adres uit de lijst om reiskosten te berekenen.
                  </p>
                ) : null}
                {fieldErrors.venueAddress ? (
                  <p className="mt-1.5 text-sm text-danger" role="alert">
                    {fieldErrors.venueAddress}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">
                  Type evenement
                </span>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-line-brand focus:ring-2 focus:ring-bookadj/25"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">
                  Bericht aan DJ{" "}
                  <span className="font-normal text-ink-muted">
                    (optioneel)
                  </span>
                </span>
                <textarea
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  rows={4}
                  placeholder="Bijv. sfeer, verzoeknummers, planning…"
                  className="mt-2 w-full resize-y rounded-lg border border-line px-3 py-2.5 text-sm outline-none placeholder:text-ink-muted focus:border-line-brand focus:ring-2 focus:ring-bookadj/25"
                />
              </label>
            </div>

            <div className="lg:hidden">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-bookadj py-3.5 text-sm font-bold text-white hover:bg-bookadj-hover disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                      aria-hidden
                    />
                    Bezig met verzenden…
                  </>
                ) : (
                  "Boeking aanvragen"
                )}
              </button>
            </div>
          </form>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Samenvatting</h2>

            <div className="mt-4 rounded-xl bg-surface-muted p-4 text-sm">
              <p className="font-semibold text-ink">{djName}</p>
              <ul className="mt-2 space-y-1 text-ink-secondary">
                <li>
                  Datum:{" "}
                  <span className="font-medium text-ink">
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
                  <span className="font-medium text-ink">
                    {startTime || "—"}
                  </span>
                </li>
                <li>
                  Duur:{" "}
                  <span className="font-medium text-ink">
                    {hours} uur
                  </span>
                </li>
                <li>
                  Locatie:{" "}
                  <span className="font-medium text-ink">
                    {venueAddress.trim() || "—"}
                  </span>
                </li>
                <li>
                  Type:{" "}
                  <span className="font-medium text-ink">
                    {eventType}
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-5 space-y-2 border-t border-line/60 pt-5 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Prijsopbouw (indicatie)
              </p>
              <div className="flex justify-between text-ink-secondary">
                <span>
                  Uurtarief × uren ({hours} × €{hourlyRate.toLocaleString("nl-NL")})
                </span>
                <span className="font-medium">
                  €{djCostEuro.toLocaleString("nl-NL")}
                </span>
              </div>
              <div className="flex justify-between text-ink-secondary">
                <span>Reiskosten (indicatie)</span>
                <span className="font-medium">
                  {travelCost > 0
                    ? `€${travelCost.toLocaleString("nl-NL")}`
                    : "€0"}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
                <span>Totaal (indicatie)</span>
                <span>€{estimatedTotalEuro.toLocaleString("nl-NL")}</span>
              </div>
              <p className="text-xs text-ink-muted">
                Het uurtarief wordt vastgelegd bij je aanvraag. Reiskosten kunnen door de DJ worden
                bevestigd.
              </p>
            </div>

            <button
              type="submit"
              form="boeking-form"
              disabled={submitting}
              className="mt-6 hidden w-full items-center justify-center gap-2 rounded-xl bg-bookadj py-3.5 text-sm font-bold text-white hover:bg-bookadj-hover disabled:opacity-50 lg:flex"
            >
              {submitting ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    aria-hidden
                  />
                  Bezig met verzenden…
                </>
              ) : (
                "Boeking aanvragen"
              )}
            </button>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-muted">
              <Lock className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden />
              Beveiligd via Stripe
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
