import Link from "next/link";
import { HomeGenreGrid } from "@/components/home-genre-grid";
import { HomeSearchForm } from "@/components/home-search-form";
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

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M6.5 8.5H3V21h3.5V8.5zM4.75 3.5a2 1.75 0 100 3.5 2 1.75 0 000-3.5zM21 21h-3.5v-5.75c0-1.37-.5-2.3-1.72-2.3-.94 0-1.5.63-1.75 1.24-.09.22-.11.53-.11.84V21H10.5s.05-9.73 0-10.73H14v1.53c.47-.72 1.3-1.75 3.17-1.75 2.3 0 4.03 1.5 4.03 4.73V21z" />
    </svg>
  );
}

function IconVisa({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="44"
      height="28"
      viewBox="0 0 44 28"
      aria-hidden
    >
      <rect width="44" height="28" rx="4" fill="#1A1F71" />
      <path
        d="M18.5 19.2l1.4-8.4h2.2l-1.4 8.4h-2.2zm7.8-8.4l-2.1 5.7-.5-2.5c-.3-1-.9-1.7-1.7-2.1l1.9 8.3h-2.1l-3.3-8.4h2.2l.5 1.3 1.1 3.1 1.3-4.4h2.6zm3.5 0c1.8 0 3.1.9 3.1 2.6 0 3.6-4.9 3.8-5.5 5.8h5.3l.6-1.7h-3.3c.2-1.1 2.1-1.2 3-3.1.5-1.1.4-2.6-1.2-2.6h-2z"
        fill="white"
      />
    </svg>
  );
}

function IconMastercard({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="44"
      height="28"
      viewBox="0 0 44 28"
      aria-hidden
    >
      <rect width="44" height="28" rx="4" fill="#F7F7F7" stroke="#E5E5E5" />
      <circle cx="18" cy="14" r="7" fill="#EB001B" />
      <circle cx="26" cy="14" r="7" fill="#F79E1B" />
      <path
        d="M22 8.2a7 7 0 010 11.6 7 7 0 000-11.6z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function IdealBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-7 min-w-[52px] items-center justify-center rounded border border-neutral-200 bg-white px-2 text-[10px] font-bold tracking-tight text-[#CC0066] ${className ?? ""}`}
      aria-hidden
    >
      iDEAL
    </span>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_2fr] lg:gap-16">
          <div>
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight text-neutral-900"
            >
              bookadj
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-600">
              De DJ boekingsmarktplaats van Nederland
            </p>
            <div className="mt-6 flex items-center gap-4 text-neutral-600">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-neutral-900"
                aria-label="Instagram"
              >
                <IconInstagram className="h-6 w-6" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-neutral-900"
                aria-label="LinkedIn"
              >
                <IconLinkedIn className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Platform</p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                <li>
                  <Link href="/zoeken" className="hover:text-neutral-900">
                    DJ&apos;s vinden
                  </Link>
                </li>
                <li>
                  <Link href="/#hoe-het-werkt" className="hover:text-neutral-900">
                    Hoe het werkt
                  </Link>
                </li>
                <li>
                  <Link href="/#voor-djs" className="hover:text-neutral-900">
                    Voor DJ&apos;s
                  </Link>
                </li>
                <li>
                  <Link href="/prijzen" className="hover:text-neutral-900">
                    Prijzen
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">Support</p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                <li>
                  <Link href="/veelgestelde-vragen" className="hover:text-neutral-900">
                    Veelgestelde vragen
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-neutral-900">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/geschillen" className="hover:text-neutral-900">
                    Geschillen
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-neutral-900">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">Juridisch</p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                <li>
                  <Link href="/voorwaarden" className="hover:text-neutral-900">
                    Algemene voorwaarden
                  </Link>
                </li>
                <li>
                  <Link href="/privacybeleid" className="hover:text-neutral-900">
                    Privacybeleid
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-neutral-900">
                    Cookiebeleid
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100 bg-neutral-50/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs text-neutral-500">
            © 2026 bookadj. Alle rechten voorbehouden.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-neutral-500">
              Betaalmethoden
            </span>
            <span className="flex items-center gap-2" aria-label="Visa, Mastercard, iDEAL">
              <IconVisa className="h-7 w-auto" />
              <IconMastercard className="h-7 w-auto" />
              <IdealBadge />
            </span>
          </div>
        </div>
      </div>
    </footer>
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
              href="/zoeken"
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
              href="/auth"
              className="text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              Inloggen
            </Link>
            <Link
              href="/auth?tab=aanmelden"
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

          <HomeSearchForm genres={genres} />
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
          <HomeGenreGrid genres={genres} />
        </div>
      </section>

      <section
        className="border-b border-neutral-100 bg-neutral-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
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
                      <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
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
                                className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700"
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
            <div className="min-w-[min(100%,280px)] max-w-sm shrink-0 snap-start sm:min-w-[300px]">
              <Link
                href="/reviews"
                className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 text-center transition-colors hover:border-neutral-900 hover:bg-neutral-100"
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
              className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-sm transition-colors hover:border-neutral-900"
            >
              Bekijk alle reviews
            </Link>
            <a
              href={PLACEHOLDER_GOOGLE_REVIEWS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
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
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              Zoek een DJ
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

      <SiteFooter />
    </div>
  );
}
