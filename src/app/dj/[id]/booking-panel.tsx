"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useMemo, useState } from "react";
import { DatePickerPopover } from "@/components/date-picker-popover";
import { StelVraagButton } from "@/components/messaging/stel-vraag-button";

const libraries = ["places"] as const;

type Props = {
  djId: string;
  djUserId?: string | null;
  hourlyRate: number;
  homeLat?: number | null;
  homeLng?: number | null;
  ratePerKm?: number | null;
  contactButtonLabel?: string;
  responseTimeLabel?: string;
  memberSinceLabel?: string;
};

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

export function BookingPanel({
  djId,
  djUserId,
  hourlyRate,
  homeLat,
  homeLng,
  ratePerKm,
  contactButtonLabel = "Stel een vraag",
  responseTimeLabel = "Binnen 2 uur",
  memberSinceLabel = "—",
}: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
    libraries: libraries as any,
  });

  const [hours, setHours] = useState(4);
  const [eventDate, setEventDate] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [travelCost, setTravelCost] = useState(0);
  const [travelDistance, setTravelDistance] = useState(0);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

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

    if (typeof homeLat === "number" && typeof homeLng === "number") {
      const crow = haversineKm(homeLat, homeLng, lat, lng);
      const roadReturnTrip = crow * 1.3 * 2;
      const kmRounded = Math.round(roadReturnTrip);
      const perKm = typeof ratePerKm === "number" && ratePerKm > 0 ? ratePerKm : 0.42;
      const cost = Math.round(roadReturnTrip * perKm);
      setTravelDistance(kmRounded);
      setTravelCost(cost);
    } else {
      setTravelDistance(0);
      setTravelCost(0);
    }
  }, [autocomplete, homeLat, homeLng, ratePerKm]);

  const djCost = useMemo(
    () => Math.round(hourlyRate * hours * 100) / 100,
    [hourlyRate, hours],
  );

  const total = useMemo(() => djCost + travelCost, [djCost, travelCost]);

  const hourOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mt-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Aantal uren
          </p>
          <div className="mt-2 flex flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {hourOptions.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHours(h)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
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

        <div className="mt-5">
          <DatePickerPopover
            value={eventDate}
            onChange={setEventDate}
            label="Datum evenement"
            placeholder="Kies een datum"
            popoverAlign="right"
            triggerClassName="flex h-[42px] w-full items-center rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-left text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
          />
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Locatie evenement
          </span>
          {isLoaded ? (
            <Autocomplete
              onLoad={(ac) => setAutocomplete(ac)}
              onPlaceChanged={onPlaceChanged}
              options={{ componentRestrictions: { country: "nl" } }}
            >
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="Straat en huisnummer, Stad"
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              placeholder="Adres laden..."
              disabled
              className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
            />
          )}
        </label>
        {travelCost > 0 ? (
          <div className="mt-2 text-xs italic text-neutral-600">
            Reiskosten: €{travelCost} (geschatte afstand: {travelDistance}km retour)
          </div>
        ) : (
          <p className="mt-2 rounded-lg bg-neutral-100 px-3 py-2 text-xs italic text-neutral-600">
            Reiskosten worden berekend na bevestiging van de DJ
          </p>
        )}

        <div className="mt-6 space-y-2 rounded-xl bg-neutral-50 px-4 py-3 text-sm">
          <div className="flex justify-between text-neutral-700">
            <span>
              DJ ({hours} uur × €{hourlyRate})
            </span>
            <span className="font-medium">
              €{djCost.toLocaleString("nl-NL")}
            </span>
          </div>
          <div className="flex justify-between text-neutral-700">
            <span>Apparatuur</span>
            <span className="font-medium text-emerald-700">Inbegrepen</span>
          </div>
          <div className="flex justify-between text-neutral-700">
            <span>Reiskosten</span>
            <span className="font-medium text-neutral-700">
              {travelCost > 0 ? `€${travelCost.toLocaleString("nl-NL")}` : "—"}
            </span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-neutral-900">
            <span>Totaal (indicatie)</span>
            <span>€{total.toLocaleString("nl-NL")}</span>
          </div>
        </div>

        <Link
          href={`/boeken/${encodeURIComponent(djId)}`}
          className="mt-5 flex w-full items-center justify-center rounded-xl bg-black py-3.5 text-sm font-bold text-emerald-400 transition-colors hover:bg-neutral-900"
        >
          Boeking aanvragen
        </Link>
        {djUserId ? (
          <StelVraagButton
            djUserId={djUserId}
            className="mt-3 w-full rounded-xl border-2 border-neutral-900 bg-white py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
          >
            {contactButtonLabel}
          </StelVraagButton>
        ) : (
          <span className="mt-3 block w-full rounded-xl border-2 border-neutral-200 py-3 text-center text-sm font-medium text-neutral-400">
            Stel een vraag
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950 ring-1 ring-emerald-200">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
        Geen betaling tot acceptatie van de boeking.
      </div>

      <div className="grid gap-3 text-sm">
        <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
          <p className="text-xs text-neutral-500">Reactietijd</p>
          <p className="font-semibold text-neutral-900">{responseTimeLabel}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
          <p className="text-xs text-neutral-500">Lid sinds</p>
          <p className="font-semibold text-neutral-900">{memberSinceLabel}</p>
        </div>
      </div>
    </div>
  );
}
