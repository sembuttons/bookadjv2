import Link from "next/link";
import { Navbar } from "@/components/Navbar";

const CITIES: { name: string; province: string }[] = [
  { name: "Amsterdam", province: "Noord-Holland" },
  { name: "Rotterdam", province: "Zuid-Holland" },
  { name: "Utrecht", province: "Utrecht" },
  { name: "Den Haag", province: "Zuid-Holland" },
  { name: "Eindhoven", province: "Noord-Brabant" },
  { name: "Tilburg", province: "Noord-Brabant" },
  { name: "Groningen", province: "Groningen" },
  { name: "Almere", province: "Flevoland" },
  { name: "Breda", province: "Noord-Brabant" },
  { name: "Nijmegen", province: "Gelderland" },
  { name: "Enschede", province: "Overijssel" },
  { name: "Haarlem", province: "Noord-Holland" },
  { name: "Arnhem", province: "Gelderland" },
  { name: "Zaanstad", province: "Noord-Holland" },
  { name: "Amersfoort", province: "Utrecht" },
  { name: "Apeldoorn", province: "Gelderland" },
  { name: "Den Bosch", province: "Noord-Brabant" },
  { name: "Hoofddorp", province: "Noord-Holland" },
  { name: "Maastricht", province: "Limburg" },
  { name: "Leiden", province: "Zuid-Holland" },
];

const CROSS_BORDER = [
  { flag: "🇧🇪", name: "België", note: "Beschikbaarheid per DJ" },
  { flag: "🇩🇪", name: "Duitsland", note: "Beschikbaarheid per DJ" },
  { flag: "🇱🇺", name: "Luxemburg", note: "Beschikbaarheid per DJ" },
] as const;

export default function StedenPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <Navbar />

      <header className="border-b border-neutral-200 bg-gradient-to-b from-neutral-50 to-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Bookadj — beschikbaar door heel Nederland én daarbuiten
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-neutral-600 sm:text-lg">
            Onze DJ&apos;s komen uit het hele land en reizen naar jouw locatie. Of je nu in Amsterdam
            zit of in een klein dorp — wij vinden de juiste DJ voor jou.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16" aria-label="Steden">
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {CITIES.map(({ name, province }) => (
            <li key={name}>
              <Link
                href={`/zoeken?${new URLSearchParams({ stad: name }).toString()}`}
                className="card-interactive flex h-full flex-col p-5 transition-all duration-200 hover:border-bookadj/35"
              >
                <span className="text-lg font-bold text-neutral-900">{name}</span>
                <span className="mt-1 text-sm text-neutral-500">{province}</span>
                <span className="mt-4 inline-flex w-fit rounded-full bg-bookadj/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-900">
                  DJ&apos;s beschikbaar
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Ook over de grens
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-neutral-600">
            Sommige bookadj DJ&apos;s zijn beschikbaar in België, Duitsland en Luxemburg.
            Beschikbaarheid verschilt per DJ — check het profiel of neem contact op.
          </p>
          <ul className="mt-12 grid gap-4 sm:grid-cols-3">
            {CROSS_BORDER.map((c) => (
              <li key={c.name}>
                <article className="h-full rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
                  <p className="text-3xl" aria-hidden>
                    {c.flag}
                  </p>
                  <h3 className="mt-3 font-bold text-neutral-900">{c.name}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{c.note}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <Link
          href="/zoeken"
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-black px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-neutral-900"
        >
          Vind een DJ bij jou in de buurt
        </Link>
      </section>
    </div>
  );
}
