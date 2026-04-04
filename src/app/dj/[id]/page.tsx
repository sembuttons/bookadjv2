import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import {
  averageFromReviews,
  getBio,
  getCity,
  getDisplayName,
  getGenres,
  getHourlyRate,
  getProfileRating,
  getReviewAuthor,
  getReviewBody,
  getReviewDate,
  getReviewRating,
  getYearsExperience,
  isVerifiedProfile,
  type DjProfileRow,
  type ReviewRow,
  starDistribution,
} from "@/lib/dj-profile-helpers";
import { supabase } from "@/lib/supabase";
import { BookingPanel } from "./booking-panel";
import { MediaTabs } from "./media-tabs";

type PageProps = { params: Promise<{ id: string }> };

function firstName(full: string) {
  const p = full.trim().split(/\s+/)[0];
  return p || full;
}

function formatMemberSince(row: DjProfileRow): string {
  const c = row.created_at ?? row.member_since;
  if (typeof c !== "string") return "—";
  const d = new Date(c);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
}

function metaAcceptance(row: DjProfileRow): string {
  const v = row.acceptance_rate ?? row.acceptance_percent;
  if (typeof v === "number") return `${Math.round(v)}%`;
  if (typeof v === "string" && v.trim()) return v.includes("%") ? v : `${v}%`;
  return "98%";
}

function metaResponse(row: DjProfileRow): string {
  const h = row.response_time_hours ?? row.avg_response_hours;
  if (typeof h === "number") return `Binnen ${h} uur`;
  if (typeof h === "string" && h.trim()) return h;
  return "Binnen 2 uur";
}

function StarBadge({ value }: { value: number }) {
  const full = Math.min(5, Math.max(0, Math.round(value)));
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">
      <span className="flex text-emerald-400" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i}>{i < full ? "★" : "☆"}</span>
        ))}
      </span>
      <span className="text-white">{value.toFixed(1)}</span>
    </span>
  );
}

export default async function DjProfilePage({ params }: PageProps) {
  const { id } = await params;

  const [profileRes, reviewsRes] = await Promise.all([
    supabase.from("dj_profiles").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("reviews")
      .select("*")
      .eq("dj_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (profileRes.error || !profileRes.data) {
    notFound();
  }

  const profile = profileRes.data as DjProfileRow;
  const reviews = (reviewsRes.error ? [] : (reviewsRes.data ?? [])) as ReviewRow[];

  const name = getDisplayName(profile);
  const city = getCity(profile);
  const years = getYearsExperience(profile);
  const genres = getGenres(profile);
  const hourly = getHourlyRate(profile) ?? 125;
  const profileAvg = getProfileRating(profile);
  const computedAvg = averageFromReviews(reviews);
  const displayRating =
    reviews.length > 0 ? computedAvg : profileAvg > 0 ? profileAvg : 4.8;
  const dist = starDistribution(reviews);
  const totalReviews = reviews.length;
  const maxBar = Math.max(1, ...Object.values(dist));

  const bio =
    getBio(profile) ||
    `${name} is een professionele DJ met oog voor detail en een brede muzikale basis. ` +
      `Van intieme borrels tot volle dansvloeren: altijd afgestemd op jouw publiek en sfeer.`;

  const fn = firstName(name);

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white shadow-sm">
        <div className="relative mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
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
            <Link href="/zoeken" className="hover:text-white">
              DJ&apos;s vinden
            </Link>
            <Link href="/#hoe-het-werkt" className="hover:text-white">
              Hoe het werkt
            </Link>
            <Link href="/#voor-djs" className="hover:text-white">
              Voor DJ&apos;s
            </Link>
          </nav>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/auth"
              className="text-sm font-medium text-white/90 hover:text-white"
            >
              Inloggen
            </Link>
            <Link
              href="/auth?tab=aanmelden"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Aanmelden
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* Gallery */}
        <div className="relative grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3">
          <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-black lg:min-h-[420px]">
            <button
              type="button"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white ring-2 ring-white/40 backdrop-blur-sm transition hover:bg-white/25"
              aria-label="Video afspelen"
            >
              <svg
                className="ml-1 h-8 w-8"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <span className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-xs text-white/90">
              Video placeholder
            </span>
          </div>
          <div className="relative grid min-h-[220px] grid-rows-2 gap-2 lg:min-h-[420px]">
            <div className="rounded-2xl bg-gradient-to-br from-neutral-300 to-neutral-500" />
            <div className="rounded-2xl bg-gradient-to-br from-neutral-400 to-neutral-600" />
            <button
              type="button"
              className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-md ring-1 ring-neutral-200 hover:bg-white"
            >
              Alle foto&apos;s tonen
            </button>
          </div>
        </div>

        {/* Name row + CTA */}
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                {name}
              </h1>
              {isVerifiedProfile(profile) ? (
                <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                  Geverifieerd
                </span>
              ) : null}
              <StarBadge value={displayRating} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-neutral-400" aria-hidden>
                  📍
                </span>
                {city}
              </span>
              {years != null ? (
                <span>{years} jaar ervaring</span>
              ) : null}
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800 ring-1 ring-neutral-200">
                Apparatuur inbegrepen
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {genres.length ? (
                genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white"
                  >
                    {g}
                  </span>
                ))
              ) : (
                <span className="text-sm text-neutral-500">
                  Genres volgen op profiel
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-1 sm:items-end">
            <button
              type="button"
              className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-900"
            >
              Stel een vraag
            </button>
            <p className="text-xs text-neutral-500 sm:text-right">
              Reageert binnen 2 uur
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_minmax(280px,360px)] lg:gap-12 lg:items-start">
          {/* LEFT */}
          <div className="min-w-0 space-y-14">
            <MediaTabs djFirstName={fn} />

            <section aria-labelledby="over-heading">
              <h2
                id="over-heading"
                className="text-xl font-bold text-neutral-900 sm:text-2xl"
              >
                Over {name}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-neutral-700">
                {bio}
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    t: "Jaren ervaring",
                    d:
                      years != null
                        ? `${years}+ jaar in events & clubs`
                        : "Ruime podiumervaring",
                  },
                  {
                    t: "Apparatuur",
                    d: "Controller, speakers en licht op aanvraag",
                  },
                  { t: "MC & aankondigingen", d: "Optioneel in overleg" },
                  {
                    t: "Voorbereiding",
                    d: "Playlist en briefing vooraf met jou afgestemd",
                  },
                  { t: "Reizen", d: "Door heel Nederland inzetbaar" },
                  { t: "Talen", d: "Nederlands & Engels" },
                ].map((card) => (
                  <li
                    key={card.t}
                    className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4"
                  >
                    <p className="text-sm font-semibold text-neutral-900">
                      {card.t}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">{card.d}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="reviews-heading">
              <h2
                id="reviews-heading"
                className="text-xl font-bold text-neutral-900 sm:text-2xl"
              >
                Beoordelingen
              </h2>
              <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
                <div className="flex shrink-0 flex-col items-center rounded-2xl border border-neutral-200 bg-white px-8 py-6 lg:items-start">
                  <p className="text-5xl font-bold text-neutral-900">
                    {displayRating.toFixed(1)}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    op basis van {totalReviews}{" "}
                    {totalReviews === 1 ? "beoordeling" : "beoordelingen"}
                  </p>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  {([5, 4, 3, 2, 1] as const).map((star) => {
                    const count = dist[star];
                    const pct = Math.round((count / maxBar) * 100);
                    return (
                      <div
                        key={star}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="w-8 text-neutral-600">{star} ★</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-neutral-500">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="mt-6 text-sm text-neutral-500">
                  Nog geen beoordelingen — wees de eerste na je boeking.
                </p>
              ) : (
                <div className="mt-8 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:px-0">
                  {reviews.map((r, i) => {
                    const rid =
                      typeof r.id === "string" || typeof r.id === "number"
                        ? String(r.id)
                        : `r-${i}`;
                    const dt = getReviewDate(r);
                    return (
                      <article
                        key={rid}
                        className="min-w-[min(100%,280px)] max-w-xs shrink-0 snap-start rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-neutral-900">
                            {getReviewAuthor(r)}
                          </p>
                          <span className="text-amber-500">
                            {"★".repeat(Math.round(getReviewRating(r)))}
                          </span>
                        </div>
                        {dt ? (
                          <p className="mt-1 text-xs text-neutral-500">
                            {dt.toLocaleDateString("nl-NL", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        ) : null}
                        <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                          {getReviewBody(r) || "—"}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section aria-labelledby="trust-heading">
              <h2
                id="trust-heading"
                className="text-xl font-bold text-neutral-900 sm:text-2xl"
              >
                Waarom bookadj
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: "🛡️",
                    t: "Betalingsbescherming",
                    d: "Geld pas vrij na je evenement.",
                  },
                  {
                    icon: "✓",
                    t: "Geverifieerde DJ’s",
                    d: "Gecontroleerde profielen en reviews.",
                  },
                  {
                    icon: "💬",
                    t: "Direct contact",
                    d: "Alles via één platform, zonder ruis.",
                  },
                  {
                    icon: "€",
                    t: "Transparante prijzen",
                    d: "Duidelijke breakdown vóór je boekt.",
                  },
                ].map((x) => (
                  <li
                    key={x.t}
                    className="flex gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5"
                  >
                    <span className="text-2xl" aria-hidden>
                      {x.icon}
                    </span>
                    <div>
                      <p className="font-semibold text-neutral-900">{x.t}</p>
                      <p className="mt-1 text-sm text-neutral-600">{x.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="faq-heading">
              <h2
                id="faq-heading"
                className="text-xl font-bold text-neutral-900 sm:text-2xl"
              >
                Veelgestelde vragen
              </h2>
              <div className="mt-4 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white px-4">
                <details className="group py-4">
                  <summary className="cursor-pointer list-none font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
                    Hoe zit het met annuleren?
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Annuleringsvoorwaarden staan in je offerte. Binnen de
                    afgesproken termijn kun je kosteloos of tegen een vast
                    percentage annuleren — afhankelijk van hoe dichtbij het
                    evenement is.
                  </p>
                </details>
                <details className="group py-4">
                  <summary className="cursor-pointer list-none font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
                    Wanneer betaal ik?
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Je betaalt veilig via bookadj. Het bedrag wordt pas definitief
                    verrekend na acceptatie door de DJ en volgens het
                    uitbetalingsmoment na je evenement.
                  </p>
                </details>
                <details className="group py-4">
                  <summary className="cursor-pointer list-none font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
                    Kan ik verzoeknummers doorgeven?
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Ja. Na boeking bespreek je je wishlist en &apos;do not
                    play&apos;-lijst rechtstreeks met de DJ.
                  </p>
                </details>
                <details className="group py-4">
                  <summary className="cursor-pointer list-none font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
                    Is alle apparatuur inbegrepen?
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Standaard is professionele DJ-gear inbegrepen. Extra licht of
                    geluid voor grote venues stem je vooraf af.
                  </p>
                </details>
                <details className="group py-4">
                  <summary className="cursor-pointer list-none font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
                    Wat als de DJ niet komt opdagen?
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Bij ernstige problemen helpt bookadj met vervanging of
                    terugbetaling volgens onze voorwaarden en Stripe-bescherming.
                  </p>
                </details>
              </div>
            </section>
          </div>

          {/* RIGHT sticky */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BookingPanel
              hourlyRate={hourly}
              djHomeCity={city}
              responseTimeLabel={metaResponse(profile)}
              acceptanceRateLabel={metaAcceptance(profile)}
              memberSinceLabel={formatMemberSince(profile)}
            />
          </aside>
        </div>

        <p className="mt-12 text-center">
          <Link
            href="/zoeken"
            className="text-sm font-medium text-neutral-600 underline hover:text-neutral-900"
          >
            ← Terug naar zoeken
          </Link>
        </p>
      </div>
    </div>
  );
}
