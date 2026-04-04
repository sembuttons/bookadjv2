import Link from "next/link";

const genres = [
  "House",
  "Techno",
  "Afro House",
  "Hip-hop",
  "Top 40",
  "Latin",
] as const;

const weekendDjs = [
  {
    initials: "MK",
    name: "Mila Koster",
    city: "Amsterdam",
    genres: ["House", "Disco"],
    rating: 4.9,
    rate: 125,
  },
  {
    initials: "JR",
    name: "Jordy R.",
    city: "Rotterdam",
    genres: ["Techno", "Melodic"],
    rating: 5.0,
    rate: 140,
  },
  {
    initials: "SV",
    name: "Sam Visser",
    city: "Utrecht",
    genres: ["Top 40", "House"],
    rating: 4.8,
    rate: 95,
  },
  {
    initials: "LN",
    name: "Lisa Nguyen",
    city: "Den Haag",
    genres: ["Latin", "Afro House"],
    rating: 4.9,
    rate: 110,
  },
] as const;

const reviews = [
  {
    quote:
      "Supersnel een DJ gevonden voor ons bedrijfsfeest. Duidelijke communicatie en topavond!",
    name: "Thomas de Vries",
    role: "Eventmanager",
    rating: 5,
  },
  {
    quote:
      "Eindelijk een platform waar je weet wat je betaalt. Onze bruiloft was perfect.",
    name: "Sophie & Mark",
    role: "Bruidspaar",
    rating: 5,
  },
  {
    quote:
      "Als DJ vind ik hier serieuze aanvragen. Betaling verloopt veilig en op tijd.",
    name: "DJ Ray",
    role: "Professioneel DJ",
    rating: 5,
  },
  {
    quote:
      "Fijne selectie in onze stad. Binnen een dag hadden we drie opties om uit te kiezen.",
    name: "Fatima El Amrani",
    role: "Feestcommissie",
    rating: 5,
  },
  {
    quote:
      "Heldere profielen en reviews. Precies wat we zochten voor ons studentengala.",
    name: "Lars Bakker",
    role: "Studievereniging",
    rating: 4,
  },
] as const;

function StarRow({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5 text-amber-400" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < value ? "" : "text-neutral-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white shadow-sm">
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 text-xl font-semibold tracking-tight text-white"
          >
            bookadj
          </Link>

          <nav
            className="order-last flex w-full justify-center gap-6 text-sm font-medium text-white/90 md:order-none md:absolute md:left-1/2 md:w-auto md:-translate-x-1/2 md:gap-8"
            aria-label="Hoofdnavigatie"
          >
            <Link
              href="#zoeken"
              className="transition-colors hover:text-white"
            >
              DJ&apos;s vinden
            </Link>
            <Link
              href="#hoe-het-werkt"
              className="transition-colors hover:text-white"
            >
              Hoe het werkt
            </Link>
            <Link
              href="#voor-djs"
              className="transition-colors hover:text-white"
            >
              Voor DJ&apos;s
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/inloggen"
              className="text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              Inloggen
            </Link>
            <Link
              href="/aanmelden"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
            >
              Aanmelden
            </Link>
          </div>
        </div>
      </header>

      <section
        id="zoeken"
        className="bg-neutral-950 px-4 py-16 text-center text-white sm:px-6 sm:py-24 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-emerald-400">
            De DJ-boekingsmarktplaats van Nederland
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Vind de perfecte DJ voor jouw evenement
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-neutral-300 sm:text-lg">
            Geverifieerde DJ&apos;s, transparante prijzen en volledige
            betalingsbescherming
          </p>

          <form
            className="mx-auto mt-10 max-w-4xl rounded-2xl bg-white p-4 shadow-xl sm:p-6"
            action="#"
            role="search"
            aria-label="DJ zoeken"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
              <label className="flex flex-col gap-1.5 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Stad
                </span>
                <input
                  type="text"
                  name="stad"
                  placeholder="Bijv. Amsterdam"
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none ring-black transition-[box-shadow] placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Datum
                </span>
                <input
                  type="date"
                  name="datum"
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none ring-black transition-[box-shadow] focus:border-neutral-400 focus:ring-2"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-left sm:col-span-2 lg:col-span-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Genre
                </span>
                <select
                  name="genre"
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none ring-black transition-[box-shadow] focus:border-neutral-400 focus:ring-2"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Kies een genre
                  </option>
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <button
                  type="submit"
                  className="h-[42px] w-full rounded-lg bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                >
                  DJ&apos;s zoeken
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section
        id="genres"
        className="border-b border-neutral-100 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="genres-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="genres-heading"
            className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
          >
            Zoek op genre
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
            Ontdek DJ&apos;s die passen bij jouw sound — van club tot bruiloft.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {genres.map((g) => (
              <li key={g}>
                <Link
                  href="#"
                  className="flex h-28 items-center justify-center rounded-xl bg-neutral-900 text-lg font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5 hover:bg-neutral-800"
                >
                  {g}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="border-b border-neutral-100 bg-neutral-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="weekend-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="weekend-heading"
            className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
          >
            Beschikbaar dit weekend
          </h2>
          <p className="mt-2 text-neutral-600">
            Een selectie van DJ&apos;s met bevestigde beschikbaarheid.
          </p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {weekendDjs.map((dj) => (
              <li key={dj.name}>
                <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white"
                      aria-hidden
                    >
                      {dj.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-neutral-900">
                        {dj.name}
                      </h3>
                      <p className="text-sm text-neutral-500">{dj.city}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {dj.genres.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <StarRow value={Math.round(dj.rating)} />
                      <span className="font-medium text-neutral-800">
                        {dj.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900">
                      vanaf €{dj.rate}/u
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="hoe-het-werkt"
        className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="how-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="how-heading"
            className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
          >
            Hoe het werkt
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
            In drie stappen van idee naar geboekte DJ — zonder gedoe.
          </p>
          <ol className="mt-12 grid gap-8 lg:grid-cols-3">
            <li>
              <article className="h-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                  1
                </span>
                <h3 className="mt-6 text-xl font-semibold text-neutral-900">
                  Zoek en vergelijk
                </h3>
                <p className="mt-2 text-neutral-600">
                  Filter op stad, datum en genre en bekijk profielen,
                  voorbeelden en reviews.
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-600">
                  <li>Transparante uurtarieven en pakketten</li>
                  <li>Geverifieerde DJ-profielen</li>
                  <li>Duidelijke beschikbaarheid</li>
                </ul>
              </article>
            </li>
            <li>
              <article className="h-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                  2
                </span>
                <h3 className="mt-6 text-xl font-semibold text-neutral-900">
                  Stuur een aanvraag
                </h3>
                <p className="mt-2 text-neutral-600">
                  Beschrijf je evenement en ontvang een voorstel dat past bij
                  jouw budget.
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-600">
                  <li>Eén plek voor alle berichten</li>
                  <li>Snelle reacties van DJ&apos;s</li>
                  <li>Geen verplichting tot boeking</li>
                </ul>
              </article>
            </li>
            <li>
              <article className="h-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                  3
                </span>
                <h3 className="mt-6 text-xl font-semibold text-neutral-900">
                  Boek met vertrouwen
                </h3>
                <p className="mt-2 text-neutral-600">
                  Betaal veilig via het platform en geniet van
                  betalingsbescherming tot na je evenement.
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-600">
                  <li>Beveiligde betalingen</li>
                  <li>Duidelijke annuleringsvoorwaarden</li>
                  <li>Support bij vragen</li>
                </ul>
              </article>
            </li>
          </ol>
        </div>
      </section>

      <section
        className="border-y border-neutral-200 bg-neutral-100 px-4 py-10 sm:px-6 lg:px-8"
        aria-label="Cijfers"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 text-center sm:gap-12 lg:gap-20">
          <div>
            <p className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              214+
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-600">
              DJ&apos;s
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              4,9/5
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-600">
              gemiddelde beoordeling
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              1200+
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-600">
              boekingen
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              97%
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-600">
              tevreden klanten
            </p>
          </div>
        </div>
      </section>

      <section
        className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="reviews-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="reviews-heading"
            className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
          >
            Wat klanten zeggen
          </h2>
          <p className="mt-2 text-neutral-600">
            Echte ervaringen van organisatoren en DJ&apos;s.
          </p>
          <div className="mt-10 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:px-0">
            {reviews.map((r) => (
              <blockquote
                key={r.name}
                className="min-w-[min(100%,280px)] max-w-sm shrink-0 snap-start rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:min-w-[300px]"
              >
                <StarRow value={r.rating} />
                <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <footer className="mt-4 border-t border-neutral-100 pt-4">
                  <p className="font-semibold text-neutral-900">{r.name}</p>
                  <p className="text-sm text-neutral-500">{r.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section
        id="voor-djs"
        className="bg-neutral-950 px-4 py-16 text-center text-white sm:px-6 sm:py-20 lg:px-8"
        aria-labelledby="cta-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="cta-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
          >
            Klaar om jouw perfecte avond te boeken?
          </h2>
          <p className="mt-4 text-neutral-300">
            Maak een account en ontdek DJ&apos;s in jouw regio — of meld je aan
            als DJ en ontvang serieuze aanvragen.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="#zoeken"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              DJ&apos;s zoeken
            </Link>
            <Link
              href="/aanmelden"
              className="rounded-lg border border-white/30 bg-transparent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Account aanmaken
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-neutral-900">bookadj</p>
            <p className="mt-2 text-sm text-neutral-600">
              De marktplaats voor professionele DJ-boekingen in Nederland.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Platform</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="#zoeken" className="hover:text-neutral-900">
                  DJ&apos;s vinden
                </Link>
              </li>
              <li>
                <Link href="#hoe-het-werkt" className="hover:text-neutral-900">
                  Hoe het werkt
                </Link>
              </li>
              <li>
                <Link href="#voor-djs" className="hover:text-neutral-900">
                  Voor DJ&apos;s
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Juridisch</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/privacy" className="hover:text-neutral-900">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/voorwaarden" className="hover:text-neutral-900">
                  Algemene voorwaarden
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-neutral-900">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/support" className="hover:text-neutral-900">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/pers" className="hover:text-neutral-900">
                  Pers
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-7xl border-t border-neutral-100 pt-8 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} bookadj. Alle rechten voorbehouden.
        </p>
      </footer>
    </div>
  );
}
