"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const KM_RATE = 0.42;

type Props = {
  djId: string;
  hourlyRate: number;
  djHomeCity: string;
  responseTimeLabel?: string;
  acceptanceRateLabel?: string;
  memberSinceLabel?: string;
};

export function BookingPanel({
  djId,
  hourlyRate,
  djHomeCity,
  responseTimeLabel = "Binnen 2 uur",
  acceptanceRateLabel = "98%",
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

        <label className="mt-5 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Datum evenement
          </span>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
          />
        </label>

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
            Reiskosten: €
            {KM_RATE.toLocaleString("nl-NL", {
              minimumFractionDigits: 2,
            })}
            /km heen en terug (geschat).
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
        <button
          type="button"
          className="mt-3 w-full rounded-xl border-2 border-neutral-900 bg-white py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
        >
          Stel een vraag
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950 ring-1 ring-emerald-200">
        <span className="text-xl" aria-hidden>
          🛡️
        </span>
        Geen betaling tot acceptatie van de boeking.
      </div>

      <div className="grid gap-3 text-sm">
        <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
          <p className="text-xs text-neutral-500">Reactietijd</p>
          <p className="font-semibold text-neutral-900">{responseTimeLabel}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
          <p className="text-xs text-neutral-500">Acceptatiegraad</p>
          <p className="font-semibold text-neutral-900">
            {acceptanceRateLabel}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
          <p className="text-xs text-neutral-500">Lid sinds</p>
          <p className="font-semibold text-neutral-900">{memberSinceLabel}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
          <p className="text-xs text-neutral-500">Betaling</p>
          <p className="font-semibold text-neutral-900">
            Veilig via bookadj (Stripe)
          </p>
        </div>
      </div>
    </div>
  );
}
