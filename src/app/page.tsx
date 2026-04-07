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

const HERO_BG_IMAGE =
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80";

const TRUST_SECTION_IMAGE =
  "https://images.unsplash.com/photo-1598387993784-808f6ee9fa6f?w=1200&q=80&auto=format&fit=crop";

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

const heroSocialProofAvatars = ["AD", "MK", "SV", "TB", "FA"] as const;

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
            i < full ? "h-4 w-4 text-green-600" : "h-4 w-4 text-gray-200"
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
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />

      {/* Hero */}
      <section
        id="zoeken"
        className="relative isolate overflow-x-clip px-4 pb-20 pt-28 text-center text-white sm:px-6 sm:pb-24 sm:pt-32 lg:px-8 lg:pb-28 lg:pt-36"
      >
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_BG_IMAGE})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, #0a0a0a 0%, #0f2818 100%)",
            opacity: 0.92,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 -z-[5]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,197,94,0.15), transparent)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-green-400">
            De DJ-boekingsmarktplaats van Nederland
          </p>
          <h1 className="text-balance text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            De beste DJ voor jouw feest —{" "}
            <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
              geverifieerd
            </span>{" "}
            en verzekerd
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-gray-400 sm:mt-6 sm:text-lg">
            Geverifieerde DJ&apos;s, transparante prijzen en volledige
            betalingsbescherming
          </p>

          <HomeSearchForm />

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10">
            <div className="flex items-center justify-center -space-x-2">
              {heroSocialProofAvatars.map((a) => (
                <div
                  key={a}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white ring-2 ring-[#0a0a0a]"
                  aria-hidden
                >
                  {a}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-white/80">
              <span className="text-green-400" aria-hidden>
                ★★★★★
              </span>
              <span>Meer dan 50 DJ&apos;s beschikbaar — vandaag nog boeken</span>
            </div>
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section
        className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
        aria-labelledby="occasion-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="occasion-heading"
              className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl"
            >
              Wat wil je boeken?
            </h2>
            <p className="mt-3 text-slate-600">
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
                  className="group flex min-w-[min(100%,220px)] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:border-green-200 hover:shadow-md hover:shadow-green-100 sm:min-w-0"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-green-100 text-green-600">
                    <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust — white content, photo right */}
      <section
        className="w-full px-4 py-20"
        aria-labelledby="trust-pro-heading"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-green-600">
              Kwaliteit &amp; veiligheid
            </p>
            <h2
              id="trust-pro-heading"
              className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl"
            >
              Boek met vertrouwen
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Eerlijke informatie, duidelijke afspraken en een platform dat met
              je meedenkt — van eerste klik tot na het feest.
            </p>

            <ul className="mt-10 grid grid-cols-2 gap-4">
              {(
                [
                  {
                    Icon: Shield,
                    title: "Veilig boeken",
                    text: "DJ's worden geverifieerd voordat ze live gaan.",
                  },
                  {
                    Icon: CreditCard,
                    title: "Betaal pas na acceptatie",
                    text: "Geen betaling zonder reactie van de DJ.",
                  },
                  {
                    Icon: MessageCircle,
                    title: "Direct contact",
                    text: "Berichten via het platform, overzichtelijk.",
                  },
                  {
                    Icon: Star,
                    title: "Eerlijke reviews",
                    text: "Alleen van klanten die geboekt hebben.",
                  },
                ] as const
              ).map(({ Icon, title, text }) => (
                <li
                  key={title}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 ring-1 ring-green-100">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {text}
                  </p>
                </li>
              ))}
            </ul>

            <Link
              href="/zoeken"
              className="mt-10 inline-flex rounded-xl bg-green-500 px-8 py-3 text-sm font-bold text-black transition-all duration-150 hover:bg-green-400 active:scale-[0.98]"
            >
              Ontdek DJ&apos;s
            </Link>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative min-h-[280px] bg-gray-50 px-4 py-8 sm:px-6 lg:rounded-3xl lg:py-10">
              <div className="relative mx-auto flex h-full min-h-[280px] w-full max-w-lg items-center justify-center lg:absolute lg:inset-0 lg:mx-0 lg:max-w-none">
                <div
                  className="aspect-[4/3] w-full max-w-md overflow-hidden rounded-3xl bg-gray-200 bg-cover bg-center shadow-xl lg:max-w-lg lg:self-center"
                  style={{ backgroundImage: `url(${TRUST_SECTION_IMAGE})` }}
                  aria-hidden
                />
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-auto sm:right-8 sm:w-[min(100%,300px)]">
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-green-400 text-sm font-bold text-black">
                        NV
                        <span
                          className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500"
                          aria-hidden
                        />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="truncate font-semibold text-slate-900">
                          DJ Nova
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-green-600">
                          Geverifieerde DJ
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      Zo zie je op het platform dat een DJ gecontroleerd is —
                      met echte reviews en duidelijke afspraken.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* New DJs */}
      <section
        className="bg-[#f8fafc] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="new-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="new-heading"
            className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl"
          >
            Nieuw toegevoegd
          </h2>
          <p className="mt-2 text-slate-600">
            De meest recente geverifieerde DJ&apos;s op bookadj.
          </p>
          {newDjs.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                icon={
                  <svg
                    className="h-7 w-7 text-green-600"
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
                  <Link href="/zoeken" className="btn-primary px-6 py-2.5 text-sm">
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
                      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gray-200/80">
                        <div className="relative flex aspect-[5/3] items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                          <span className="absolute left-3 top-3 z-[1] rounded-full bg-gradient-to-r from-green-500 to-green-400 px-2 py-0.5 text-xs font-bold text-black shadow-sm">
                            Geverifieerd
                          </span>
                          <span
                            className="text-2xl font-black text-white drop-shadow-md"
                            aria-hidden
                          >
                            {initialsFromName(name)}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="truncate font-bold text-gray-900">
                            {name}
                          </h3>
                          <p className="text-sm text-gray-500">{city}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {djGenres.length > 0 ? (
                              djGenres.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                                Diverse stijlen
                              </span>
                            )}
                          </div>
                          <div className="mt-4 flex items-end justify-between pt-4">
                            <div>
                              <p className="text-lg font-black text-gray-900">
                                {rate != null
                                  ? `€${Math.round(rate)}`
                                  : "—"}
                                {rate != null ? (
                                  <span className="text-sm font-semibold text-gray-500">
                                    /uur
                                  </span>
                                ) : null}
                              </p>
                              {rate == null ? (
                                <p className="text-xs text-gray-500">
                                  Op aanvraag
                                </p>
                              ) : null}
                            </div>
                            <div className="text-right text-sm">
                              <StarRow value={Math.round(displayRating)} />
                              <p className="mt-1 font-semibold text-green-600">
                                {displayRating.toFixed(1)}
                              </p>
                            </div>
                          </div>
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

      {/* How it works */}
      <section
        id="hoe-het-werkt"
        className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="how-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="how-heading"
            className="text-center text-2xl font-black tracking-tight text-gray-900 sm:text-3xl"
          >
            Hoe het werkt
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            In drie stappen van idee naar geboekte DJ — zonder gedoe.
          </p>
          <div
            className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-green-500 to-green-400"
            aria-hidden
          />

          <ol className="relative mt-12 grid gap-8 lg:grid-cols-3">
            <div
              className="pointer-events-none absolute left-[18%] right-[18%] top-6 hidden h-0 lg:block"
              aria-hidden
            />
            {(
              [
                {
                  n: "1",
                  title: "Zoek en vergelijk",
                  desc: "Kies datum en genre en bekijk profielen, voorbeelden en reviews.",
                  bullets: [
                    "Duidelijke tariefinformatie en pakketten",
                    "Geverifieerde DJ-profielen",
                    "Filter op datum en genre",
                  ],
                },
                {
                  n: "2",
                  title: "Stuur een aanvraag",
                  desc: "Beschrijf je evenement en ontvang een voorstel dat past bij jouw budget.",
                  bullets: [
                    "Eén plek voor alle berichten",
                    "Snelle reacties van DJ's",
                    "Geen verplichting tot boeking",
                  ],
                },
                {
                  n: "3",
                  title: "Boek met vertrouwen",
                  desc: "Betaal veilig via het platform en geniet van betalingsbescherming tot na je evenement.",
                  bullets: [
                    "Beveiligde betalingen",
                    "Duidelijke annuleringsvoorwaarden",
                    "Support bij vragen",
                  ],
                },
              ] as const
            ).map((step) => (
              <li key={step.n} className="relative">
                <article className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <span className="relative z-[1] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-lg font-black text-black shadow-sm">
                    {step.n}
                  </span>
                  <h3 className="mt-6 text-lg font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">{step.desc}</p>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-500">
                    {step.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Reviews */}
      <section
        className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="reviews-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="reviews-heading"
            className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl"
          >
            Wat klanten zeggen
          </h2>
          <p className="mt-2 text-slate-600">
            Echte ervaringen van organisatoren en DJ&apos;s.
          </p>
          <div
            className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-green-500 to-green-400"
            aria-hidden
          />
          <div className="mt-10 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:px-0">
            {reviews.map((r) => (
              <blockquote
                key={r.name}
                className="min-w-[min(100%,280px)] max-w-sm shrink-0 snap-start rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-green-200 hover:shadow-md sm:min-w-[300px]"
              >
                <StarRow value={r.rating} />
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <footer className="mt-4 pt-4">
                  <p className="font-semibold text-gray-900">{r.name}</p>
                  <p className="text-sm text-slate-500">{r.role}</p>
                </footer>
              </blockquote>
            ))}
            <div className="min-w-[min(100%,280px)] max-w-sm shrink-0 snap-start sm:min-w-[300px]">
              <Link
                href="/reviews"
                className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-[#f8fafc] px-6 py-8 text-center transition-all duration-200 hover:border-green-300 hover:bg-green-50/50"
              >
                <span className="text-sm font-semibold text-gray-900">
                  Lees alle reviews
                </span>
                <span className="mt-2 text-xs text-slate-500">
                  Bekijk het volledige overzicht
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link href="/reviews" className="btn-secondary px-6 py-3 text-sm">
              Bekijk alle reviews
            </Link>
            <a
              href={PLACEHOLDER_GOOGLE_REVIEWS}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-6 py-3 text-sm"
            >
              Reviews op Google
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="voor-djs"
        className="relative isolate overflow-hidden px-4 py-16 text-center text-white sm:px-6 sm:py-20 lg:px-8"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #052e16 100%)",
        }}
        aria-labelledby="cta-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(34,197,94,0.2), transparent)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl">
          <h2
            id="cta-heading"
            className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Klaar voor jouw perfecte{" "}
            <span className="text-green-400">avond</span>?
          </h2>
          <p className="mt-4 text-gray-400">
            Maak een account en ontdek DJ&apos;s in jouw regio — of meld je aan
            als DJ en ontvang serieuze aanvragen.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/zoeken"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-green-400 px-8 py-4 text-sm font-bold text-black transition-all duration-150 hover:from-green-400 hover:to-green-300 active:scale-[0.98]"
            >
              Zoek een DJ
            </Link>
            <Link
              href="/aanmelden"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-8 py-4 text-sm font-semibold text-white transition-all duration-150 hover:bg-white/10"
            >
              Account aanmaken
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
