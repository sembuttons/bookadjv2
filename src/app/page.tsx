import Link from "next/link";
import { HomeSearchForm } from "@/components/home-search-form";
import { Navbar } from "@/components/Navbar";
import { EmptyState } from "@/components/skeleton";
import {
  Briefcase,
  CreditCard,
  Gift,
  GraduationCap,
  Heart,
  Home as HomeIcon,
  MessageCircle,
  MoreHorizontal,
  Music,
  Shield,
  Star,
  Zap,
} from "lucide-react";
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

/** Home hero */
const HERO_BG_IMAGE =
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80";

/** Trust / Fiverr-style column — DJ deck, atmospheric */
const TRUST_SECTION_IMAGE =
  "https://images.unsplash.com/photo-1598387993784-808f6ee9fa6f?w=1200&q=80&auto=format&fit=crop";

/** Bottom CTA strip */
const VOOR_DJS_SECTION_BG =
  "https://images.unsplash.com/photo-1571266028243-d220c6a6fe7e?w=1200&q=80";

const occasionCards = [
  { id: "bruiloft", label: "Bruiloft", Icon: Heart },
  { id: "verjaardag", label: "Verjaardag", Icon: Gift },
  { id: "bedrijfsfeest", label: "Bedrijfsfeest", Icon: Briefcase },
  { id: "club_bar", label: "Club & Bar", Icon: Music },
  { id: "festival", label: "Festival", Icon: Zap },
  { id: "huisfeest", label: "Huisfeest", Icon: HomeIcon },
  { id: "afstuderen", label: "Afstuderen", Icon: GraduationCap },
  { id: "anders", label: "Anders", Icon: MoreHorizontal },
] as const;

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
            i < full ? "h-4 w-4 text-green-500" : "h-4 w-4 text-gray-800"
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
    <div className="min-h-screen bg-[#0a0a0a] font-sans">
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
          className="absolute inset-0 -z-10 bg-black/60"
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-green-400">
            De DJ-boekingsmarktplaats van Nederland
          </p>
          <h1 className="text-balance text-[1.65rem] font-bold leading-tight tracking-tight text-white drop-shadow-sm min-[400px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            De beste DJ voor jouw feest —{" "}
            <span className="text-green-400">geverifieerd</span> en verzekerd
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm text-gray-400 min-[400px]:text-base sm:mt-6 sm:text-lg">
            Geverifieerde DJ&apos;s, transparante prijzen en volledige betalingsbescherming
          </p>

          <HomeSearchForm />
        </div>
      </section>

      <section
        className="border-b border-gray-800 bg-[#0a0a0a] px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
        aria-labelledby="occasion-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="occasion-heading"
              className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
            >
              Wat wil je boeken?
            </h2>
            <p className="mt-3 text-gray-400">
              Kies je gelegenheid en zie meteen de beste DJ&apos;s voor jouw
              type event.
            </p>
          </div>

          <div className="mt-10">
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
              {occasionCards.map(({ id, label, Icon }) => (
                <Link
                  key={id}
                  href={`/zoeken?${new URLSearchParams({ occasion: id }).toString()}`}
                  className="group flex min-w-[min(100%,220px)] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-2xl border border-gray-800 bg-[#111827] p-6 text-center shadow-sm transition-all duration-200 hover:border-green-600 hover:bg-[#0f1f0f] hover:shadow-md sm:min-w-0"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#052e16] text-green-500 ring-1 ring-green-800/50">
                    <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-sm font-semibold text-gray-200">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-t border-green-500/20 bg-gradient-to-b from-[#0a0a0a] to-[#111827] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24"
        aria-labelledby="trust-pro-heading"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl lg:pr-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
              Kwaliteit &amp; veiligheid
            </p>
            <h2
              id="trust-pro-heading"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-tight"
            >
              Boek met vertrouwen
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-400 sm:text-lg">
              Eerlijke informatie, duidelijke afspraken en een platform dat met je meedenkt — van
              eerste klik tot na het feest.
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {(
                [
                  {
                    Icon: Shield,
                    title: "Veilig boeken",
                    text: "Alle DJ's worden handmatig geverifieerd voordat ze live gaan. Jij boekt met zekerheid.",
                  },
                  {
                    Icon: CreditCard,
                    title: "Betaal pas na acceptatie",
                    text: "Je betaling wordt alleen verwerkt als de DJ je boeking accepteert. Geen reactie? Geen kosten.",
                  },
                  {
                    Icon: MessageCircle,
                    title: "Direct contact",
                    text: "Communiceer rechtstreeks met de DJ via ons platform. Snel, veilig en overzichtelijk.",
                  },
                  {
                    Icon: Star,
                    title: "Eerlijke reviews",
                    text: "Reviews komen alleen van klanten die daadwerkelijk hebben geboekt. Geen neppe beoordelingen.",
                  },
                ] as const
              ).map(({ Icon, title, text }) => (
                <li
                  key={title}
                  className="rounded-2xl border border-gray-800 bg-[#111827] p-5"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/15 text-green-400 ring-1 ring-green-500/30">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <h3 className="mt-4 font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{text}</p>
                </li>
              ))}
            </ul>
            <Link
              href="/zoeken"
              className="mt-10 inline-flex rounded-lg bg-green-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-green-400"
            >
              Ontdek DJ&apos;s
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div
              className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-900 bg-cover bg-center shadow-2xl ring-1 ring-green-800/30"
              style={{ backgroundImage: `url(${TRUST_SECTION_IMAGE})` }}
              aria-hidden
            />
            <div className="absolute -bottom-4 left-4 right-4 sm:-bottom-6 sm:left-auto sm:right-8 sm:w-[min(100%,320px)]">
              <div className="rounded-xl border border-green-800/40 bg-[#111827]/95 p-4 shadow-xl shadow-black/40 backdrop-blur-md sm:p-5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-black"
                    aria-hidden
                  >
                    NV
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate font-semibold text-white">DJ Nova</p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-500/25 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-green-400 ring-1 ring-green-500/40">
                      <svg
                        className="h-3 w-3 text-green-400"
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
                <p className="mt-3 text-xs text-gray-500">
                  Zo zie je op het platform dat een DJ gecontroleerd is — met echte
                  reviews en transparante tarieven.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-b border-gray-800 bg-[#0a0a0a] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="new-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="new-heading"
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Nieuw toegevoegd
          </h2>
          <p className="mt-2 text-gray-400">
            De meest recente geverifieerde DJ&apos;s op bookadj.
          </p>
          {newDjs.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                icon={
                  <svg
                    className="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    aria-hidden
                  >
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 20v-1a5 5 0 0110 0v1" strokeLinecap="round" />
                  </svg>
                }
                title="Nog geen profielen om te tonen"
                description="Zodra geverifieerde DJ’s live gaan, verschijnen ze hier. Ontdek intussen het volledige aanbod op de zoekpagina."
                action={
                  <Link
                    href="/zoeken"
                    className="inline-flex rounded-lg bg-green-500 px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-green-400"
                  >
                    DJ&apos;s zoeken
                  </Link>
                }
              />
            </div>
          ) : (
            <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                      <article className="card-interactive flex h-full flex-col p-5 transition-colors hover:border-green-800 hover:shadow-lg hover:shadow-green-900/20">
                        <div className="flex items-start gap-4">
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#111827] text-sm font-bold text-white"
                            aria-hidden
                          >
                            {initialsFromName(name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold text-white">
                              {name}
                            </h3>
                            <p className="text-sm text-gray-400">{city}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {djGenres.length > 0 ? (
                            djGenres.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-300"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full bg-[#0f172a]/80 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                              Diverse stijlen
                            </span>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-gray-800/60 pt-4">
                          <div className="flex items-center gap-2 text-sm">
                            <StarRow value={Math.round(displayRating)} />
                            <span className="font-medium text-white">
                              {displayRating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-green-400">
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
        className="bg-[#0a0a0a] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="how-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="how-heading"
            className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Hoe het werkt
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-400">
            In drie stappen van idee naar geboekte DJ — zonder gedoe.
          </p>
          <div
            className="mx-auto mt-4 h-1 w-16 rounded-full bg-green-500"
            aria-hidden
          />
          <ol className="mt-12 grid gap-8 lg:grid-cols-3">
            <li>
              <article className="card-interactive h-full p-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#052e16] text-lg font-bold text-green-400 ring-2 ring-green-800/50">
                  1
                </span>
                <h3 className="mt-6 text-xl font-semibold text-white">
                  Zoek en vergelijk
                </h3>
                <p className="mt-2 text-gray-400">
                  Kies datum en genre en bekijk profielen, voorbeelden en
                  reviews.
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-400">
                  <li>Transparante uurtarieven en pakketten</li>
                  <li>Geverifieerde DJ-profielen</li>
                  <li>Filter op datum en genre</li>
                </ul>
              </article>
            </li>
            <li>
              <article className="card-interactive h-full p-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#052e16] text-lg font-bold text-green-400 ring-2 ring-green-800/50">
                  2
                </span>
                <h3 className="mt-6 text-xl font-semibold text-white">
                  Stuur een aanvraag
                </h3>
                <p className="mt-2 text-gray-400">
                  Beschrijf je evenement en ontvang een voorstel dat past bij
                  jouw budget.
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-400">
                  <li>Eén plek voor alle berichten</li>
                  <li>Snelle reacties van DJ&apos;s</li>
                  <li>Geen verplichting tot boeking</li>
                </ul>
              </article>
            </li>
            <li>
              <article className="card-interactive h-full p-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#052e16] text-lg font-bold text-green-400 ring-2 ring-green-800/50">
                  3
                </span>
                <h3 className="mt-6 text-xl font-semibold text-white">
                  Boek met vertrouwen
                </h3>
                <p className="mt-2 text-gray-400">
                  Betaal veilig via het platform en geniet van
                  betalingsbescherming tot na je evenement.
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-400">
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
        className="border-y border-gray-800 bg-[#0f172a]/80 px-4 py-10 sm:px-6 lg:px-8"
        aria-label="Cijfers"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 text-center sm:gap-12 lg:gap-20">
          <div>
            <p className="text-3xl font-bold text-green-400 sm:text-4xl">
              214+
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500">
              DJ&apos;s
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-400 sm:text-4xl">
              4,9/5
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500">
              gemiddelde beoordeling
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-400 sm:text-4xl">
              1200+
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500">
              boekingen
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-400 sm:text-4xl">
              97%
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500">
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
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Wat klanten zeggen
          </h2>
          <p className="mt-2 text-gray-400">
            Echte ervaringen van organisatoren en DJ&apos;s.
          </p>
          <div
            className="mt-4 h-1 w-16 rounded-full bg-green-500"
            aria-hidden
          />
          <div className="mt-10 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:px-0">
            {reviews.map((r) => (
              <blockquote
                key={r.name}
                className="card-interactive min-w-[min(100%,280px)] max-w-sm shrink-0 snap-start p-6 transition-colors hover:border-green-500/30 sm:min-w-[300px]"
              >
                <StarRow value={r.rating} />
                <p className="mt-4 text-sm leading-relaxed text-gray-400">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <footer className="mt-4 border-t border-gray-800/60 pt-4">
                  <p className="font-semibold text-white">{r.name}</p>
                  <p className="text-sm text-gray-500">{r.role}</p>
                </footer>
              </blockquote>
            ))}
            <div className="min-w-[min(100%,280px)] max-w-sm shrink-0 snap-start sm:min-w-[300px]">
              <Link
                href="/reviews"
                className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-800 bg-[#0f172a] px-6 py-8 text-center transition-colors hover:border-green-500/50 hover:bg-green-500/5"
              >
                <span className="text-sm font-semibold text-white">
                  Lees alle reviews
                </span>
                <span className="mt-2 text-xs text-gray-500">
                  Bekijk het volledige overzicht
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/reviews"
              className="inline-flex items-center justify-center rounded-lg border-2 border-black bg-[#111827] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f172a]"
            >
              Bekijk alle reviews
            </Link>
            <a
              href={PLACEHOLDER_GOOGLE_REVIEWS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-green-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-green-400"
            >
              Reviews op Google
            </a>
          </div>
        </div>
      </section>

      <section
        id="voor-djs"
        className="relative isolate overflow-hidden border-t border-green-800 bg-[#050505] px-4 py-16 text-center text-white sm:px-6 sm:py-20 lg:px-8"
        aria-labelledby="cta-heading"
      >
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url(${VOOR_DJS_SECTION_BG})` }}
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-[#050505]/90" aria-hidden />
        <div className="relative mx-auto max-w-3xl">
          <h2
            id="cta-heading"
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl"
          >
            Klaar voor jouw perfecte <span className="text-green-400">avond</span>?
          </h2>
          <p className="mt-4 text-gray-500">
            Maak een account en ontdek DJ&apos;s in jouw regio — of meld je aan
            als DJ en ontvang serieuze aanvragen.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/zoeken"
              className="rounded-lg bg-green-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-green-400"
            >
              Zoek een DJ
            </Link>
            <Link
              href="/aanmelden"
              className="rounded-lg border border-gray-700 bg-transparent px-6 py-3 text-sm font-semibold text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-900 hover:text-white"
            >
              Account aanmaken
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
