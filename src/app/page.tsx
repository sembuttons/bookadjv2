import Link from "next/link";
import { HomeGenreGrid } from "@/components/home-genre-grid";
import { HomeSearchForm } from "@/components/home-search-form";
import { Navbar } from "@/components/Navbar";
import { PaymentMethodBadges } from "@/components/payment-method-badges";
import {
  getCity,
  getGenres,
  getHourlyRate,
  getProfileRating,
  getStageName,
  type DjProfileRow,
} from "@/lib/dj-profile-helpers";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

const genres = [
  "House",
  "Techno",
  "Afro House",
  "Hip-hop",
  "Top 40",
  "Latin",
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

const PLACEHOLDER_GOOGLE_REVIEWS = "https://www.google.com";

/** Placeholder hero — replace with branded asset when ready */
const HERO_BG_IMAGE =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&q=80&auto=format&fit=crop";

/** Trust section — DJ / crowd placeholder */
const TRUST_SECTION_IMAGE =
  "https://images.unsplash.com/photo-1571266028243-e631f2e28e4b?w=1200&q=80&auto=format&fit=crop";

function initialsFromName(name: string) {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "");
  const s = parts.join("");
  return s || "DJ";
}

function StarRow({ value }: { value: number }) {
  const full = Math.min(5, Math.max(0, Math.round(value)));
  return (
    <span className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={
            i < full ? "h-4 w-4 text-amber-400" : "h-4 w-4 text-neutral-300"
          }
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default async function Home() {
  const { data: newDjRows } = await supabase
    .from("dj_profiles")
    .select("*")
    .eq("is_visible", true)
    .eq("verification_status", "verified")
    .order("created_at", { ascending: false })
    .limit(4);

  const newDjs = (newDjRows ?? []) as DjProfileRow[];

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <section
        id="zoeken"
        className="relative isolate overflow-hidden px-4 pb-20 pt-28 text-center text-white sm:px-6 sm:pb-24 sm:pt-32 lg:px-8 lg:pb-28 lg:pt-36"
      >
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_BG_IMAGE})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/75 via-black/60 to-black/85"
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-emerald-400">
            De DJ-boekingsmarktplaats van Nederland
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight drop-shadow-sm sm:text-4xl md:text-5xl lg:text-6xl">
            Vind de perfecte DJ voor jouw evenement
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-neutral-200 sm:text-lg">
            Geverifieerde DJ&apos;s, transparante prijzen en volledige
            betalingsbescherming
          </p>

          <HomeSearchForm genres={genres} />
        </div>
      </section>

      <section
        className="border-t border-emerald-500/25 bg-neutral-950 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24"
        aria-labelledby="trust-pro-heading"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl lg:pr-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Kwaliteit &amp; veiligheid
            </p>
            <h2
              id="trust-pro-heading"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-tight"
            >
              Boek met vertrouwen
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-300 sm:text-lg">
              Elke DJ doorloopt ID- en bedrijfscontrole. Betalingen verlopen
              veilig via het platform — pas belast wanneer je boeking is
              geaccepteerd. Jij feest, wij regelen de rest.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-neutral-300">
              <li className="flex gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black"
                  aria-hidden
                >
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6l2.5 2.5L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Geverifieerde profielen en duidelijke reviews
              </li>
              <li className="flex gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black"
                  aria-hidden
                >
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6l2.5 2.5L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Beschermde betaling tot na je evenement
              </li>
              <li className="flex gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black"
                  aria-hidden
                >
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6l2.5 2.5L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Support bij vragen of wijzigingen
              </li>
            </ul>
            <Link
              href="/zoeken"
              className="mt-10 inline-flex rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-emerald-400"
            >
              Ontdek DJ&apos;s
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div
              className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-800 bg-cover bg-center shadow-2xl ring-1 ring-white/10"
              style={{ backgroundImage: `url(${TRUST_SECTION_IMAGE})` }}
              aria-hidden
            />
            <div className="absolute -bottom-4 left-4 right-4 sm:-bottom-6 sm:left-auto sm:right-8 sm:w-[min(100%,320px)]">
              <div className="rounded-xl border border-white/20 bg-black/75 p-4 shadow-xl backdrop-blur-md sm:p-5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-black"
                    aria-hidden
                  >
                    NV
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate font-semibold text-white">DJ Nova</p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-500/40">
                      <svg
                        className="h-3 w-3 text-emerald-400"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M5 10l3 3 7-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Geverifieerde DJ
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-neutral-400">
                  Zo zie je op het platform dat een DJ gecontroleerd is — met echte
                  reviews en transparante tarieven.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="genres"
        className="border-b-2 border-black px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="genres-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="genres-heading"
            className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
          >
            Zoek op genre
          </h2>
          <div
            className="mx-auto mt-4 h-1 w-16 rounded-full bg-emerald-500"
            aria-hidden
          />
          <p className="mx-auto mt-4 max-w-xl text-center text-neutral-600">
            Ontdek DJ&apos;s die passen bij jouw sound — van club tot bruiloft.
          </p>
          <HomeGenreGrid genres={genres} />
        </div>
      </section>

      <section
        className="border-b border-neutral-200 bg-neutral-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="new-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="new-heading"
            className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
          >
            Nieuw toegevoegd
          </h2>
          <p className="mt-2 text-neutral-600">
            De meest recente geverifieerde DJ&apos;s op bookadj.
          </p>
          {newDjs.length === 0 ? (
            <p className="mt-10 text-center text-sm text-neutral-500">
              Er zijn nog geen openbare profielen om te tonen.{" "}
              <Link href="/zoeken" className="font-medium text-neutral-900 underline">
                Bekijk alle DJ&apos;s
              </Link>
            </p>
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newDjs.map((dj) => {
                const name = getStageName(dj);
                const city = getCity(dj);
                const djGenres = getGenres(dj).slice(0, 3);
                const rate = getHourlyRate(dj);
                const rating = getProfileRating(dj);
                const displayRating = rating > 0 ? rating : 4.8;
                return (
                  <li key={dj.id}>
                    <Link href={`/dj/${dj.id}`}>
                      <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                        <div className="flex items-start gap-4">
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white"
                            aria-hidden
                          >
                            {initialsFromName(name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold text-neutral-900">
                              {name}
                            </h3>
                            <p className="text-sm text-neutral-500">{city}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {djGenres.length > 0 ? (
                            djGenres.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-neutral-800"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-500">
                              Diverse stijlen
                            </span>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
                          <div className="flex items-center gap-2 text-sm">
                            <StarRow value={Math.round(displayRating)} />
                            <span className="font-medium text-neutral-800">
                              {displayRating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-neutral-900">
                            {rate != null
                              ? `vanaf €${Math.round(rate)}/u`
                              : "Tarief op aanvraag"}
                          </p>
                        </div>
                      </article>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
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
          <div
            className="mx-auto mt-4 h-1 w-16 rounded-full bg-emerald-500"
            aria-hidden
          />
          <ol className="mt-12 grid gap-8 lg:grid-cols-3">
            <li>
              <article className="h-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-lg font-bold text-emerald-400 ring-2 ring-emerald-500/50">
                  1
                </span>
                <h3 className="mt-6 text-xl font-semibold text-neutral-900">
                  Zoek en vergelijk
                </h3>
                <p className="mt-2 text-neutral-600">
                  Kies datum en genre en bekijk profielen, voorbeelden en
                  reviews.
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-600">
                  <li>Transparante uurtarieven en pakketten</li>
                  <li>Geverifieerde DJ-profielen</li>
                  <li>Filter op datum en genre</li>
                </ul>
              </article>
            </li>
            <li>
              <article className="h-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-lg font-bold text-emerald-400 ring-2 ring-emerald-500/50">
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
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-lg font-bold text-emerald-400 ring-2 ring-emerald-500/50">
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
        className="border-y-2 border-black bg-neutral-100 px-4 py-10 sm:px-6 lg:px-8"
        aria-label="Cijfers"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 text-center sm:gap-12 lg:gap-20">
          <div>
            <p className="text-3xl font-bold text-emerald-700 sm:text-4xl">
              214+
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-600">
              DJ&apos;s
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-emerald-700 sm:text-4xl">
              4,9/5
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-600">
              gemiddelde beoordeling
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-emerald-700 sm:text-4xl">
              1200+
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-600">
              boekingen
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-emerald-700 sm:text-4xl">
              97%
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-600">
              tevreden klanten
            </p>
          </div>
        </div>
      </section>

      <section
        className="border-b border-neutral-200 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
        aria-labelledby="payment-methods-heading"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="payment-methods-heading"
            className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl"
          >
            Betaal veilig
          </h2>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">
            Betalingen verlopen via Stripe. Kies de methode die bij jou past.
          </p>
          <PaymentMethodBadges
            className="mt-8 justify-center"
            variant="light"
          />
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
          <div
            className="mt-4 h-1 w-16 rounded-full bg-emerald-500"
            aria-hidden
          />
          <div className="mt-10 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:px-0">
            {reviews.map((r) => (
              <blockquote
                key={r.name}
                className="min-w-[min(100%,280px)] max-w-sm shrink-0 snap-start rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-colors hover:border-emerald-200 sm:min-w-[300px]"
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
            <div className="min-w-[min(100%,280px)] max-w-sm shrink-0 snap-start sm:min-w-[300px]">
              <Link
                href="/reviews"
                className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-50/50"
              >
                <span className="text-sm font-semibold text-neutral-900">
                  Lees alle reviews
                </span>
                <span className="mt-2 text-xs text-neutral-500">
                  Bekijk het volledige overzicht
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/reviews"
              className="inline-flex items-center justify-center rounded-lg border-2 border-black bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50"
            >
              Bekijk alle reviews
            </Link>
            <a
              href={PLACEHOLDER_GOOGLE_REVIEWS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-sm font-semibold text-emerald-400 transition-colors hover:bg-neutral-900"
            >
              Reviews op Google
            </a>
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
              href="/zoeken"
              className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-emerald-400"
            >
              Zoek een DJ
            </Link>
            <Link
              href="/aanmelden"
              className="rounded-lg border-2 border-white/40 bg-transparent px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-emerald-400/60 hover:text-emerald-200"
            >
              Account aanmaken
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
