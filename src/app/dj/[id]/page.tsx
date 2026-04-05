import Link from "next/link";
import {
  BadgeCheck,
  CircleDollarSign,
  Headphones,
  LayoutDashboard,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { notFound } from "next/navigation";
import {
  averageFromReviews,
  getBio,
  getCity,
  getGenres,
  getHourlyRate,
  getProfileRating,
  getReviewAuthor,
  getReviewBody,
  getReviewDate,
  getReviewRating,
  getStageName,
  getYearsExperience,
  isVerifiedProfile,
  type DjProfileRow,
  type ReviewRow,
  starDistribution,
} from "@/lib/dj-profile-helpers";
import { StelVraagButton } from "@/components/messaging/stel-vraag-button";
import { supabase } from "@/lib/supabase";
import { BookingPanel } from "./booking-panel";
import { DjHelpSection } from "./dj-help-section";
import { DjProfileFaq } from "./dj-profile-faq";
import { DjUspGrid, type UspItem } from "./dj-usp-grid";
import { MediaTabs } from "./media-tabs";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

function firstName(full: string) {
  const p = full.trim().split(/\s+/)[0];
  return p || full;
}

function formatSidebarMemberSince(row: DjProfileRow): string {
  const c = row.created_at ?? row.member_since;
  if (typeof c !== "string") return "—";
  const d = new Date(c);
  if (Number.isNaN(d.getTime())) return "—";
  const monthRaw = d.toLocaleDateString("nl-NL", { month: "long" });
  const month =
    monthRaw.charAt(0).toLocaleUpperCase("nl-NL") +
    monthRaw.slice(1).toLowerCase();
  const year = d.getFullYear();
  return `${month} ${year}`;
}

function metaResponse(row: DjProfileRow): string {
  const h = row.response_time_hours ?? row.avg_response_hours;
  if (typeof h === "number") return `Binnen ${h} uur`;
  if (typeof h === "string" && h.trim()) return h;
  return "Binnen 2 uur";
}

function StarSvg({ filled }: { filled: boolean }) {
  return (
    <svg
      className={filled ? "h-3.5 w-3.5 text-amber-400" : "h-3.5 w-3.5 text-neutral-300"}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function StarRow({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  const full = Math.min(5, Math.max(0, Math.round(value)));
  const starClass =
    size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`${starClass} ${i < full ? "text-amber-400" : "text-neutral-300"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function parseCustomUsps(row: DjProfileRow): UspItem[] {
  const raw = row.custom_usps;
  if (raw == null) return [];
  let arr: unknown;
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      return [];
    }
  } else {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  const out: UspItem[] = [];
  for (const u of arr) {
    if (!u || typeof u !== "object") continue;
    const o = u as Record<string, unknown>;
    const title = typeof o.title === "string" ? o.title.trim() : "";
    if (!title) continue;
    out.push({
      icon_name: typeof o.icon_name === "string" ? o.icon_name : "star",
      title,
      description:
        typeof o.description === "string" ? o.description.trim() : "",
    });
  }
  return out;
}

function ArrowLeftLink() {
  return (
    <svg
      className="mr-1 inline h-4 w-4 -mt-0.5 align-middle"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M12.5 15L7.5 10l5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

  const name = getStageName(profile);
  const displayForBio = getStageName(profile);
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
    `${displayForBio} is een professionele DJ met oog voor detail en een brede muzikale basis. ` +
      `Van intieme borrels tot volle dansvloeren: altijd afgestemd op jouw publiek en sfeer.`;

  const fn = firstName(name);
  const djUserId =
    typeof profile.user_id === "string" ? profile.user_id : "";
  const customUsps = parseCustomUsps(profile);

  const instagramUrl =
    typeof profile.instagram_url === "string"
      ? profile.instagram_url
      : null;
  const soundcloudUrl =
    typeof profile.soundcloud_url === "string"
      ? profile.soundcloud_url
      : null;

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <Navbar />

      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
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

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              {name}
            </h1>

            {isVerifiedProfile(profile) ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                <svg
                  className="h-3.5 w-3.5 shrink-0"
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
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-[#111110]">
              <span className="inline-flex items-center gap-1.5">
                <svg
                  className="h-4 w-4 shrink-0 text-[#111110]"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="11"
                    r="2.25"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  />
                </svg>
                {city}
              </span>
            </div>
            {genres.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white"
                  >
                    {g}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col gap-1 sm:items-end">
            {djUserId ? (
              <StelVraagButton
                djUserId={djUserId}
                className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-900"
              >
                Stel {fn} een vraag
              </StelVraagButton>
            ) : (
              <span className="rounded-xl bg-neutral-200 px-6 py-3 text-sm font-medium text-neutral-500">
                Stel een vraag
              </span>
            )}
            <p className="text-xs text-neutral-500 sm:text-right">
              Reageert binnen 2 uur
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_minmax(280px,360px)] lg:gap-12 lg:items-start">
          <div className="min-w-0 space-y-14">
            <MediaTabs
              djFirstName={fn}
              instagramUrl={instagramUrl}
              soundcloudUrl={soundcloudUrl}
            />

            <section aria-labelledby="over-heading">
              <h2
                id="over-heading"
                className="text-xl font-bold text-neutral-900 sm:text-2xl"
              >
                Over {displayForBio}
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

            <DjUspGrid stageName={displayForBio} items={customUsps} />

            {reviews.length > 0 ? (
              <section aria-labelledby="reviews-heading">
                <h2
                  id="reviews-heading"
                  className="text-xl font-bold text-neutral-900 sm:text-2xl"
                >
                  Reviews
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
                          <span className="flex w-14 items-center gap-1 text-neutral-600">
                            {star}
                            <StarSvg filled />
                          </span>
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
                <div className="mt-8 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:px-0">
                  {reviews.map((r, i) => {
                    const rid =
                      typeof r.id === "string" || typeof r.id === "number"
                        ? String(r.id)
                        : `r-${i}`;
                    const dt = getReviewDate(r);
                    const rating = Math.round(getReviewRating(r));
                    return (
                      <article
                        key={rid}
                        className="min-w-[min(100%,280px)] max-w-xs shrink-0 snap-start rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-neutral-900">
                            {getReviewAuthor(r)}
                          </p>
                          <StarRow value={rating} size="sm" />
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
              </section>
            ) : null}

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
                    Icon: CircleDollarSign,
                    t: "Jij betaalt nooit voor niets",
                    d: "Kaart pas belast bij acceptatie. Geen reactie? Volledig terugbetaald.",
                  },
                  {
                    Icon: BadgeCheck,
                    t: "Elke DJ is geverifieerd",
                    d: "ID-controle, KVK-verificatie en Stripe KYC voordat een DJ live gaat.",
                  },
                  {
                    Icon: Headphones,
                    t: "Wij staan achter elke boeking",
                    d: "DJ annuleert? Wij regelen een vervanger of betalen je volledig terug.",
                  },
                  {
                    Icon: LayoutDashboard,
                    t: "Alles op één plek, altijd veilig",
                    d: "Betaling, communicatie en boeking via één beveiligd platform.",
                  },
                ].map(({ Icon, t, d }) => (
                  <li
                    key={t}
                    className="flex gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5"
                  >
                    <Icon
                      className="h-8 w-8 shrink-0 text-neutral-900"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <div>
                      <p className="font-semibold text-neutral-900">{t}</p>
                      <p className="mt-1 text-sm text-neutral-600">{d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <DjHelpSection />

            <DjProfileFaq />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BookingPanel
              djId={id}
              djUserId={djUserId || null}
              hourlyRate={hourly}
              contactButtonLabel={`Stel ${fn} een vraag`}
              responseTimeLabel={metaResponse(profile)}
              memberSinceLabel={formatSidebarMemberSince(profile)}
            />
          </aside>
        </div>

        <p className="mt-12 text-center">
          <Link
            href="/zoeken"
            className="inline-flex items-center text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeftLink />
            Terug naar zoeken
          </Link>
        </p>
      </div>
    </div>
  );
}
