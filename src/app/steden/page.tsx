import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { NederlandCoverageMap } from "./nederland-coverage-map";

const CROSS_BORDER = [
  { flag: "🇧🇪", name: "België", note: "Beschikbaarheid per DJ" },
  { flag: "🇩🇪", name: "Duitsland", note: "Beschikbaarheid per DJ" },
  { flag: "🇱🇺", name: "Luxemburg", note: "Beschikbaarheid per DJ" },
] as const;

export default function StedenPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />

      <header className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Beschikbaar door heel Nederland en daarbuiten
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
            bookadj DJ&apos;s komen uit alle uithoeken van Nederland en reizen naar jouw locatie.
            Groot of klein, stad of dorp: wij vinden de perfecte DJ.
          </p>
        </div>
      </header>

      <section
        className="bg-[#f0fdf4] px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
        aria-label="Dekking in Nederland"
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
            Nederlandse dekking
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-600">
            Hover over een stip voor de stad. Onze DJ&apos;s zijn actief in het hele land.
          </p>
          <div className="mt-10">
            <NederlandCoverageMap />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Ook over de grens
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Sommige bookadj DJ&apos;s zijn beschikbaar in België, Duitsland en Luxemburg.
            Beschikbaarheid verschilt per DJ. Check het profiel of neem contact op.
          </p>
          <ul className="mt-12 grid gap-4 sm:grid-cols-3">
            {CROSS_BORDER.map((c) => (
              <li key={c.name}>
                <article className="h-full rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                  <p className="text-3xl" aria-hidden>
                    {c.flag}
                  </p>
                  <h3 className="mt-3 font-bold text-slate-900">{c.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{c.note}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 text-center sm:px-6 lg:px-8">
        <Link
          href="/zoeken"
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-green-500 px-8 py-3 text-sm font-bold text-black shadow-sm transition-colors hover:bg-green-400"
        >
          Vind een DJ bij jou in de buurt
        </Link>
      </section>
    </div>
  );
}
