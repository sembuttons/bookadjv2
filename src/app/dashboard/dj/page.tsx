function formatEuro(n: number) {
  return `€ ${n.toLocaleString("nl-NL", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function netFromGross(gross: number) {
  return Math.round(gross * 0.85 * 100) / 100;
}

type MockRequest = {
  id: string;
  customerName: string;
  eventDate: string;
  time: string;
  hours: number;
  venueCity: string;
  eventType: string;
  customerMessage: string;
  grossAmount: number;
  expiresInHours: number;
};

const mockRequests: MockRequest[] = [
  {
    id: "r1",
    customerName: "Sophie de Wit",
    eventDate: "18 april 2026",
    time: "21:00 – 02:00",
    hours: 5,
    venueCity: "Amsterdam",
    eventType: "Privéfeest",
    customerMessage:
      "We zoeken een DJ die house en disco kan mixen; ongeveer 80 gasten.",
    grossAmount: 750,
    expiresInHours: 18,
  },
  {
    id: "r2",
    customerName: "Mark Jansen",
    eventDate: "3 mei 2026",
    time: "19:00 – 00:00",
    hours: 5,
    venueCity: "Utrecht",
    eventType: "Bedrijfsborrel",
    customerMessage:
      "Rustige achtergrond tijdens netwerkborrel, daarna wat meer tempo.",
    grossAmount: 620,
    expiresInHours: 41,
  },
  {
    id: "r3",
    customerName: "Elena Rossi",
    eventDate: "22 april 2026",
    time: "22:00 – 03:00",
    hours: 5,
    venueCity: "Rotterdam",
    eventType: "Club / feest",
    customerMessage: "Techno en melodic house, 21+ publiek.",
    grossAmount: 900,
    expiresInHours: 6,
  },
];

type MockConfirmed = {
  id: string;
  date: string;
  customerName: string;
  venue: string;
  hours: number;
  netPayoutAmount: number;
  payoutReleaseDate: string;
  status: "uitbetaling_gepland" | "betaald";
};

const mockConfirmed: MockConfirmed[] = [
  {
    id: "c1",
    date: "28 april 2026",
    customerName: "Thomas Bakker",
    venue: "Rotterdam — Fenix Food Factory",
    hours: 6,
    netPayoutAmount: 552.5,
    payoutReleaseDate: "30 april 2026, 23:00",
    status: "uitbetaling_gepland",
  },
  {
    id: "c2",
    date: "12 mei 2026",
    customerName: "Fatima El Amrani",
    venue: "Den Haag — Loungeruimte Waterfront",
    hours: 4,
    netPayoutAmount: 340,
    payoutReleaseDate: "14 mei 2026, 22:00",
    status: "uitbetaling_gepland",
  },
  {
    id: "c3",
    date: "2 maart 2026",
    customerName: "Studievereniging VSV",
    venue: "Eindhoven — Studentencentrum",
    hours: 5,
    netPayoutAmount: 425,
    payoutReleaseDate: "4 maart 2026, 21:00",
    status: "betaald",
  },
];

function confirmedStatusBadge(status: MockConfirmed["status"]) {
  if (status === "betaald") {
    return "bg-emerald-100 text-emerald-800 ring-emerald-600/20";
  }
  return "bg-amber-100 text-amber-900 ring-amber-600/20";
}

function confirmedStatusLabel(status: MockConfirmed["status"]) {
  if (status === "betaald") {
    return "Betaald";
  }
  return "Uitbetaling gepland";
}

export default function DjDashboardPage() {
  return (
    <div className="space-y-14">
      <section aria-labelledby="nieuwe-aanvragen-heading">
        <h1
          id="nieuwe-aanvragen-heading"
          className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
        >
          Nieuwe aanvragen
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Inbox — klanten die je willen boeken. Reageer voordat de aanvraag
          verloopt.
        </p>

        <ul className="mt-6 space-y-4">
          {mockRequests.map((req) => {
            const net = netFromGross(req.grossAmount);
            return (
              <li key={req.id}>
                <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold text-neutral-900">
                            {req.customerName}
                          </h2>
                          <p className="mt-1 text-sm text-neutral-600">
                            {req.eventType} · {req.venueCity}
                          </p>
                        </div>
                        <p className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-950 ring-1 ring-amber-500/30">
                          Vervalt over {req.expiresInHours} uur
                        </p>
                      </div>

                      <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-neutral-500">Datum</dt>
                          <dd className="font-medium text-neutral-900">
                            {req.eventDate}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-neutral-500">Tijd</dt>
                          <dd className="font-medium text-neutral-900">
                            {req.time}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-neutral-500">Duur</dt>
                          <dd className="font-medium text-neutral-900">
                            {req.hours} uur
                          </dd>
                        </div>
                        <div>
                          <dt className="text-neutral-500">Locatie (stad)</dt>
                          <dd className="font-medium text-neutral-900">
                            {req.venueCity}
                          </dd>
                        </div>
                      </dl>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Bericht van klant
                        </p>
                        <p className="mt-1.5 rounded-lg bg-neutral-50 px-3 py-2.5 text-sm text-neutral-800">
                          {req.customerMessage}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-6 border-t border-neutral-100 pt-4">
                        <div>
                          <p className="text-xs text-neutral-500">Bruto (aanbod)</p>
                          <p className="text-lg font-bold text-neutral-900">
                            {formatEuro(req.grossAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">
                            Netto (na 15% platformfee)
                          </p>
                          <p className="text-lg font-bold text-emerald-700">
                            {formatEuro(net)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:w-44 lg:flex-col">
                      <button
                        type="button"
                        className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
                      >
                        Accepteren
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 transition-colors hover:bg-red-100"
                      >
                        Weigeren
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="bevestigde-heading">
        <h2
          id="bevestigde-heading"
          className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl"
        >
          Bevestigde boekingen
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Geplande optredens en uitbetalingen (48 uur na het einde van het
          evenement).
        </p>

        <ul className="mt-6 space-y-4">
          {mockConfirmed.map((b) => (
            <li key={b.id}>
              <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {b.customerName}
                      </h3>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${confirmedStatusBadge(b.status)}`}
                      >
                        {confirmedStatusLabel(b.status)}
                      </span>
                    </div>
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-neutral-500">Datum evenement</dt>
                        <dd className="font-medium text-neutral-900">
                          {b.date}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-neutral-500">Duur</dt>
                        <dd className="font-medium text-neutral-900">
                          {b.hours} uur
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-neutral-500">Locatie</dt>
                        <dd className="font-medium text-neutral-900">
                          {b.venue}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-neutral-500">Netto uitbetaling</dt>
                        <dd className="text-lg font-bold text-emerald-700">
                          {formatEuro(b.netPayoutAmount)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-neutral-500">
                          Vrijgave uitbetaling
                        </dt>
                        <dd className="font-medium text-neutral-900">
                          {b.payoutReleaseDate}{" "}
                          <span className="block text-xs font-normal text-neutral-500">
                            (48 uur na einde evenement)
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
