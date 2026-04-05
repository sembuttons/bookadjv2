"use client";

import Link from "next/link";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { ShieldCheck } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { DatePickerPopover } from "@/components/date-picker-popover";
import { AskDjLauncherButton } from "./ask-dj-modal";

const KM_RATE = 0.42;
const libraries: ("places")[] = ["places"];

type Props = {
  djId: string;
  hourlyRate: number;
  djHomeCity: string;
  /** Voor Distance Matrix: volledig adres of stad */
  djOriginAddress: string;
  responseTimeLabel?: string;
  memberSinceLabel?: string;
};

function TravelLine({
  kmOneWay,
  costRoundTrip,
}: {
  kmOneWay: number;
  costRoundTrip: number;
}) {
  return (
    <p className="mt-2 text-sm font-medium text-neutral-900">
      Reiskosten: €{costRoundTrip.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
      <span className="font-normal text-neutral-600">
        ({kmOneWay.toLocaleString("nl-NL", { maximumFractionDigits: 1 })} km via de weg)
      </span>
    </p>
  );
}

function BookingPanelPlain({
  djId,
  hourlyRate,
  djHomeCity,
  responseTimeLabel = "Binnen 2 uur",
  memberSinceLabel = "—",
}: Props) {
  const [hours, setHours] = useState(4);
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [distanceKm, setDistanceKm] = useState(35);

  const travelCost = useMemo(() => {
    const returnKm = distanceKm * 2;
    return Math.round(returnKm * KM_RATE * 100) / 100;
  }, [distanceKm]);

  const djCost = useMemo(
    () => Math.round(hourlyRate * hours * 100) / 100,
    [hourlyRate, hours],
  );

  const total = useMemo(
    () => Math.round((djCost + travelCost) * 100) / 100,
    [djCost, travelCost],
  );

  const hourOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-4xl font-bold tracking-tight text-neutral-900">
          €{hourlyRate.toLocaleString("nl-NL")}
          <span className="text-xl font-semibold text-neutral-500">/uur</span>
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Apparatuur altijd inbegrepen
        </p>

        <div className="mt-5">
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
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Adres of plaats"
            className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Enkele reis vanaf {djHomeCity} (km)
          </span>
          <input
            type="number"
            min={0}
            max={500}
            step={1}
            value={distanceKm}
            onChange={(e) =>
              setDistanceKm(Math.max(0, Number(e.target.value) || 0))
            }
            className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Voeg{" "}
            <code className="rounded bg-neutral-100 px-1">NEXT_PUBLIC_GOOGLE_MAPS_KEY</code>{" "}
            toe voor automatische route en reiskosten.
          </p>
        </label>

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
            <span className="font-medium">
              €{travelCost.toLocaleString("nl-NL")}
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
        <AskDjLauncherButton className="mt-3 w-full rounded-xl border-2 border-neutral-900 bg-white py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50" />
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

function BookingPanelWithGoogle(p: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY?.trim() ?? "";
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  if (loadError) {
    return <BookingPanelPlain {...p} />;
  }

  if (!isLoaded) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
        Kaarten laden…
      </div>
    );
  }

  return <BookingPanelGoogleLoaded {...p} />;
}

function BookingPanelGoogleLoaded({
  djId,
  hourlyRate,
  djHomeCity,
  djOriginAddress,
  responseTimeLabel = "Binnen 2 uur",
  memberSinceLabel = "—",
}: Props) {
  const [hours, setHours] = useState(4);
  const [eventDate, setEventDate] = useState("");
  const [travelKmOneWay, setTravelKmOneWay] = useState<number | null>(null);
  const [travelCost, setTravelCost] = useState<number | null>(null);

  const acRef = useRef<google.maps.places.Autocomplete | null>(null);
  const venueInputRef = useRef<HTMLInputElement>(null);

  const runMatrix = useCallback(
    (dest: google.maps.LatLng | google.maps.LatLngLiteral) => {
      const origin =
        djOriginAddress.trim() ||
        `${djHomeCity}, Nederland`;
      const service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [dest],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (res, status) => {
          if (status !== "OK" || !res?.rows?.[0]?.elements?.[0]) {
            setTravelKmOneWay(null);
            setTravelCost(null);
            return;
          }
          const el = res.rows[0].elements[0];
          if (el.status !== "OK" || el.distance?.value == null) {
            setTravelKmOneWay(null);
            setTravelCost(null);
            return;
          }
          const meters = el.distance.value;
          const kmOne = meters / 1000;
          const cost = Math.round(kmOne * 2 * KM_RATE * 100) / 100;
          setTravelKmOneWay(Math.round(kmOne * 10) / 10);
          setTravelCost(cost);
        },
      );
    },
    [djHomeCity, djOriginAddress],
  );

  const onPlaceChanged = useCallback(() => {
    const place = acRef.current?.getPlace();
    if (!place?.geometry?.location) return;
    const addr =
      place.formatted_address ??
      place.name ??
      place.vicinity ??
      "";
    if (venueInputRef.current && addr) {
      venueInputRef.current.value = addr;
    }
    runMatrix(place.geometry.location);
  }, [runMatrix]);

  const effectiveTravelCost = travelCost ?? 0;
  const djCost = useMemo(
    () => Math.round(hourlyRate * hours * 100) / 100,
    [hourlyRate, hours],
  );
  const total = useMemo(
    () => Math.round((djCost + effectiveTravelCost) * 100) / 100,
    [djCost, effectiveTravelCost],
  );

  const hourOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-4xl font-bold tracking-tight text-neutral-900">
          €{hourlyRate.toLocaleString("nl-NL")}
          <span className="text-xl font-semibold text-neutral-500">/uur</span>
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Apparatuur altijd inbegrepen
        </p>

        <div className="mt-5">
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

        <div className="mt-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Locatie evenement
          </span>
          <div className="mt-2">
            <Autocomplete
              onLoad={(a) => {
                acRef.current = a;
              }}
              onPlaceChanged={onPlaceChanged}
              options={{
                componentRestrictions: { country: "nl" },
                fields: ["formatted_address", "geometry", "name", "vicinity"],
              }}
            >
              <input
                ref={venueInputRef}
                type="text"
                placeholder="Zoek adres of locatie"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
              />
            </Autocomplete>
          </div>
          {travelKmOneWay != null && travelCost != null ? (
            <TravelLine kmOneWay={travelKmOneWay} costRoundTrip={travelCost} />
          ) : (
            <p className="mt-2 text-xs text-neutral-500">
              Kies een adres om de route en reiskosten te berekenen.
            </p>
          )}
        </div>

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
            <span className="font-medium">
              €{effectiveTravelCost.toLocaleString("nl-NL")}
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
        <AskDjLauncherButton className="mt-3 w-full rounded-xl border-2 border-neutral-900 bg-white py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50" />
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

export function BookingPanel(props: Props) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY?.trim() ?? "";
  if (!key) {
    return <BookingPanelPlain {...props} />;
  }
  return <BookingPanelWithGoogle {...props} />;
}
