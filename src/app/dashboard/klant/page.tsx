"use client";

import { useMemo, useState } from "react";

type BookingStatus = "aangevraagd" | "bevestigd" | "afgerond" | "geannuleerd";

type FilterTab = "alle" | BookingStatus;

type MockBooking = {
  id: string;
  djName: string;
  status: BookingStatus;
  date: string;
  time: string;
  city: string;
  eventType: string;
  hours: number;
  totalPrice: number;
};

const mockUpcoming = {
  djName: "Mila Koster",
  date: "12 april 2026",
  time: "20:00 – 02:00",
  location: "Amsterdam, De Hallen",
  countdownDays: 3,
};

const mockBookings: MockBooking[] = [
  {
    id: "1",
    djName: "Mila Koster",
    status: "bevestigd",
    date: "12 apr 2026",
    time: "20:00 – 02:00",
    city: "Amsterdam",
    eventType: "Bedrijfsfeest",
    hours: 6,
    totalPrice: 890,
  },
  {
    id: "2",
    djName: "Jordy R.",
    status: "aangevraagd",
    date: "2 mei 2026",
    time: "22:00 – 03:00",
    city: "Rotterdam",
    eventType: "Verjaardag",
    hours: 5,
    totalPrice: 0,
  },
  {
    id: "3",
    djName: "Sam Visser",
    status: "afgerond",
    date: "15 mrt 2026",
    time: "19:00 – 01:00",
    city: "Utrecht",
    eventType: "Bruiloft",
    hours: 6,
    totalPrice: 720,
  },
  {
    id: "4",
    djName: "Lisa Nguyen",
    status: "geannuleerd",
    date: "8 mrt 2026",
    time: "21:00 – 02:00",
    city: "Den Haag",
    eventType: "Clubavond",
    hours: 5,
    totalPrice: 0,
  },
  {
    id: "5",
    djName: "DJ Ray",
    status: "bevestigd",
    date: "28 apr 2026",
    time: "18:00 – 23:00",
    city: "Eindhoven",
    eventType: "Bedrijfsborrel",
    hours: 5,
    totalPrice: 650,
  },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function statusBadgeClasses(status: BookingStatus) {
  switch (status) {
    case "bevestigd":
      return "bg-emerald-100 text-emerald-800 ring-emerald-600/20";
    case "aangevraagd":
      return "bg-amber-100 text-amber-900 ring-amber-600/20";
    case "afgerond":
      return "bg-neutral-200 text-neutral-700 ring-neutral-500/15";
    case "geannuleerd":
      return "bg-red-100 text-red-800 ring-red-600/20";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
}

function statusLabel(status: BookingStatus) {
  switch (status) {
    case "bevestigd":
      return "Bevestigd";
    case "aangevraagd":
      return "Wacht op reactie";
    case "afgerond":
      return "Afgerond";
    case "geannuleerd":
      return "Geannuleerd";
    default:
      return status;
  }
}

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "alle", label: "Alle boekingen" },
  { id: "aangevraagd", label: "Aangevraagd" },
  { id: "bevestigd", label: "Bevestigd" },
  { id: "afgerond", label: "Afgelopen" },
  { id: "geannuleerd", label: "Geannuleerd" },
];

export default function KlantDashboardPage() {
  const [filter, setFilter] = useState<FilterTab>("alle");

  const filteredBookings = useMemo(() => {
    if (filter === "alle") return mockBookings;
    return mockBookings.filter((b) => b.status === filter);
  }, [filter]);

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
        Mijn boekingen
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Overzicht van je aanvragen en bevestigde optredens.
      </p>

      <section
        className="mt-8 overflow-hidden rounded-2xl bg-neutral-950 text-white ring-1 ring-emerald-500/40"
        aria-label="Aankomend evenement"
      >
        <div className="border-b border-emerald-500/30 bg-emerald-500/15 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Aankomend evenement
          </p>
        </div>
        <div className="flex flex-col gap-6 px-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xl font-bold text-white sm:text-2xl">
              {mockUpcoming.djName}
            </p>
            <ul className="grid gap-2 text-sm text-neutral-300 sm:grid-cols-2">
              <li>
                <span className="text-neutral-500">Datum</span>{" "}
                <span className="font-medium text-white">
                  {mockUpcoming.date}
                </span>
              </li>
              <li>
                <span className="text-neutral-500">Tijd</span>{" "}
                <span className="font-medium text-white">
                  {mockUpcoming.time}
                </span>
              </li>
              <li className="sm:col-span-2">
                <span className="text-neutral-500">Locatie</span>{" "}
                <span className="font-medium text-white">
                  {mockUpcoming.location}
                </span>
              </li>
            </ul>
            <p className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-500/40">
              Nog {mockUpcoming.countdownDays}{" "}
              {mockUpcoming.countdownDays === 1 ? "dag" : "dagen"}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <button
              type="button"
              className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
            >
              Bericht DJ
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Details
            </button>
          </div>
        </div>
      </section>

      <div
        className="mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filter boekingen"
      >
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={filter === tab.id}
            onClick={() => setFilter(tab.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab.id
                ? "bg-black text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-4" aria-label="Boekingen">
        {filteredBookings.map((booking) => (
          <li key={booking.id}>
            <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white"
                    aria-hidden
                  >
                    {initials(booking.djName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-neutral-900">
                        {booking.djName}
                      </h2>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusBadgeClasses(booking.status)}`}
                      >
                        {statusLabel(booking.status)}
                      </span>
                    </div>
                    <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-neutral-500">Datum & tijd</dt>
                        <dd className="font-medium text-neutral-900">
                          {booking.date} · {booking.time}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-neutral-500">Stad</dt>
                        <dd className="font-medium text-neutral-900">
                          {booking.city}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-neutral-500">Soort evenement</dt>
                        <dd className="font-medium text-neutral-900">
                          {booking.eventType}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-neutral-500">Duur</dt>
                        <dd className="font-medium text-neutral-900">
                          {booking.hours} uur
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <div className="flex flex-col items-stretch gap-3 border-t border-neutral-100 pt-4 sm:w-48 sm:shrink-0 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                  <p className="text-sm text-neutral-500">Totaal</p>
                  <p className="text-xl font-bold text-neutral-900">
                    {booking.totalPrice > 0
                      ? `€ ${booking.totalPrice.toLocaleString("nl-NL")}`
                      : "—"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                    >
                      Details
                    </button>
                    {booking.status === "aangevraagd" ||
                    booking.status === "bevestigd" ? (
                      <button
                        type="button"
                        className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                      >
                        Bericht
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      {filteredBookings.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-600">
          Geen boekingen in deze categorie.
        </p>
      ) : null}
    </>
  );
}
