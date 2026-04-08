import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Lock,
  Headset,
  Headphones,
  LayoutDashboard,
  Languages,
  MapPin,
  Music,
  Music2,
  NotebookPen,
  SlidersHorizontal,
  Speech,
  Star as StarIcon,
  Play,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { notFound } from "next/navigation";
import {
  averageFromReviews,
  getBio,
  getCity,
  getGenres,
  getHourlyRate,
  getProfilePhotoUrls,
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
import { videoEmbedSrc } from "@/lib/video-embed";
import { StelVraagButton } from "@/components/messaging/stel-vraag-button";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-server";
import { BookingPanel } from "./booking-panel";
import { DjHelpSection } from "./dj-help-section";
import { DjProfileFaq } from "./dj-profile-faq";
import { DjUspGrid, type UspItem } from "./dj-usp-grid";
import { RelatedDjsCarousel } from "./related-djs-carousel";
import { MobileStickyBookingBar } from "./mobile-sticky-booking-bar";
import { DjInstagramPhotoGrid } from "./dj-instagram-photo-grid";

export const dynamic = "force-dynamic";

const DJ_GALLERY_MAIN =
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80&auto=format&fit=crop";
const DJ_GALLERY_2 =
  "https://images.unsplash.com/photo-1598387993784-808f6ee9fa6f?w=800&q=80&auto=format&fit=crop";
const DJ_GALLERY_3 =
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa88?w=800&q=80&auto=format&fit=crop";

function shuffleDjPool<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type PageProps = { params: Promise<{ id: string }> };

function firstName(full: string) {
  const p = full.trim().split(/\s+/)[0];
  return p || full;
}

function initialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "");
  return parts.join("") || "?";
}

function formatSidebarMemberSince(row: DjProfileRow): string {
  const c = row.created_at ?? row.member_since;
  if (typeof c !== "string") return "-";
  const d = new Date(c);
  if (Number.isNaN(d.getTime())) return "-";
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

function avgResponseHoursText(row: DjProfileRow): string {
  const h = row.response_time_hours ?? row.avg_response_hours;
  if (typeof h === "number" && !Number.isNaN(h)) return `${h} uur`;
  return "2 uur";
}

function StarSvg({ filled }: { filled: boolean }) {
  return (
    <svg
      className={filled ? "h-3.5 w-3.5 text-amber-400" : "h-3.5 w-3.5 text-gray-400"}
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
  const starClass = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`${starClass} ${i < full ? "text-amber-400" : "text-gray-400"}`}
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

  const [profileRes, reviewsRes, ownerRes, availRes] = await Promise.all([
    supabase.from("dj_profiles").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("reviews")
      .select("*")
      .eq("dj_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("dj_profiles").select("user_id").eq("id", id).maybeSingle(),
    supabase.from("dj_availability").select("blocked_date").eq("dj_id", id),
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

  const ownerRow =
    !ownerRes.error && ownerRes.data
      ? (ownerRes.data as { user_id?: string | null })
      : null;
  const fromOwner =
    typeof ownerRow?.user_id === "string" && ownerRow.user_id.trim()
      ? ownerRow.user_id.trim()
      : "";
  const fromProfile =
    typeof profile.user_id === "string" && profile.user_id.trim()
      ? profile.user_id.trim()
      : "";
  const djUserId = fromOwner || fromProfile;

  const customUsps = parseCustomUsps(profile);

  let relatedPool: DjProfileRow[] = [];
  if (genres.length > 0) {
    const genreRes = await supabase
      .from("dj_profiles")
      .select("*")
      .eq("is_visible", true)
      .eq("verification_status", "verified")
      .neq("id", id)
      .contains("genres", [genres[0]])
      .limit(6);
    if (!genreRes.error && genreRes.data && genreRes.data.length > 0) {
      relatedPool = genreRes.data as DjProfileRow[];
    }
  }
  if (relatedPool.length === 0) {
    const fb = await supabase
      .from("dj_profiles")
      .select("*")
      .eq("is_visible", true)
      .eq("verification_status", "verified")
      .neq("id", id)
      .limit(30);
    relatedPool = (fb.error ? [] : (fb.data ?? [])) as DjProfileRow[];
  }
  const relatedDjs = shuffleDjPool(relatedPool).slice(0, 6);

  const instagramUrl =
    typeof profile.instagram_url === "string" ? profile.instagram_url : null;
  const soundcloudUrl =
    typeof profile.soundcloud_url === "string" ? profile.soundcloud_url : null;
  const languagesRaw = (profile as any).languages;
  const languages =
    Array.isArray(languagesRaw)
      ? (languagesRaw as unknown[]).filter(
          (x): x is string => typeof x === "string" && Boolean(x.trim()),
        )
      : typeof languagesRaw === "string"
        ? languagesRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
  const extraLanguagesRaw = (profile as any).extra_languages;
  const extraLanguages =
    typeof extraLanguagesRaw === "string"
      ? extraLanguagesRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  const languagesLabel = [...languages, ...extraLanguages].filter(Boolean).join(", ");

  const equipmentRaw = (profile as Record<string, unknown>).equipment;
  const equipmentList = Array.isArray(equipmentRaw)
    ? equipmentRaw.filter((x): x is string => typeof x === "string" && Boolean(x.trim()))
    : [];
  const customEquipmentRaw = (profile as Record<string, unknown>).custom_equipment;
  const customEquipment =
    typeof customEquipmentRaw === "string" ? customEquipmentRaw.trim() : "";
  const equipmentParts = [
    ...equipmentList,
    ...(customEquipment ? [customEquipment] : []),
  ];
  const equipmentFromUsps =
    customUsps.length > 0
      ? customUsps
          .map((u) => u.title)
          .filter(Boolean)
          .slice(0, 2)
          .join(", ")
      : "";
  const apparatuurLabel =
    (equipmentParts.length > 0
      ? equipmentParts.join(", ")
      : equipmentFromUsps
    ).trim() || "Professionele apparatuur";

  const experienceLabel =
    typeof years === "number" && years > 0
      ? `${years}+ jaar in events & clubs`
      : "Opkomend talent";
  const talenLabel = (languagesLabel || "").trim() || "Nederlands, Engels";

  const instagramHandle = (() => {
    if (!instagramUrl) return "";
    try {
      const u = new URL(instagramUrl);
      const parts = u.pathname.split("/").filter(Boolean);
      const h = parts[0] ?? "";
      return h ? `@${h.replace(/^@/, "")}` : "";
    } catch {
      const m = instagramUrl.match(/instagram\.com\/([^/?#]+)/i);
      const h = m?.[1] ?? "";
      return h ? `@${h.replace(/^@/, "")}` : "";
    }
  })();

  const blockedIsoDates = availRes.error
    ? []
    : (availRes.data ?? [])
        .map((r) => (r as { blocked_date?: string }).blocked_date)
        .filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d));

  const photoUrls = getProfilePhotoUrls(profile);
  const hasPhotos = photoUrls.length > 0;
  const videoRaw =
    typeof profile.video_url === "string" ? profile.video_url.trim() : "";
  const youtubeId = (() => {
    if (!videoRaw) return "";
    try {
      const u = new URL(videoRaw);
      const host = u.hostname.replace(/^www\./, "");
      if (host === "youtu.be") {
        const id = u.pathname.split("/").filter(Boolean)[0] ?? "";
        return id;
      }
      if (host === "youtube.com" || host === "m.youtube.com") {
        const v = u.searchParams.get("v");
        if (v) return v;
        const parts = u.pathname.split("/").filter(Boolean);
        const embedIdx = parts.indexOf("embed");
        if (embedIdx >= 0) return parts[embedIdx + 1] ?? "";
      }
      return "";
    } catch {
      return "";
    }
  })();
  const hasYouTubeVideo = Boolean(youtubeId);
  const hasAnyMedia =
    hasPhotos || Boolean(instagramUrl) || Boolean(soundcloudUrl) || hasYouTubeVideo;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 lg:items-start">
          <div className="min-w-0 space-y-14">
            {/* Name + badge + location + genres - all in one block */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-green-50 ring-2 ring-gray-100">
                    {hasPhotos ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrls[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-black text-green-700">
                        {initialsFromName(name)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                {/* Name inline with verified badge */}
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 min-[400px]:text-3xl sm:text-4xl">
                    {name}
                  </h1>
                  {isVerifiedProfile(profile) ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black shadow-sm">
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
                  {totalReviews > 5 ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-400 ring-1 ring-amber-200">
                      Veel geboekt
                    </div>
                  ) : null}
                </div>

                {/* Rating directly under name */}
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="flex items-center gap-0.5" aria-hidden>
                    {Array.from({ length: 5 }, (_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(displayRating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                      />
                    ))}
                  </span>
                  <span>{displayRating.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">
                    · {totalReviews} beoordelingen
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 text-gray-400" aria-hidden />
                  <span>{city}</span>
                </div>

                {/* Genres */}
                {genres.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g) => (
                      <span
                        key={g}
                        className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Bio - directly under genres */}
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-gray-400">
                  {bio}
                </p>
                  </div>
                </div>

                <DjInstagramPhotoGrid photos={photoUrls} name={name} />
              </div>

              {/* Stel een vraag */}
              <div className="flex w-full shrink-0 flex-col gap-1 sm:w-auto sm:items-end">
                <StelVraagButton
                  djUserId={djUserId || undefined}
                  djProfileId={id}
                  className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-green-500 to-green-400 px-6 py-3 text-center text-sm font-bold text-black transition-all duration-150 hover:from-green-400 hover:to-green-300 active:scale-[0.98] sm:w-auto"
                >
                  Stel {fn} een vraag
                </StelVraagButton>
                <p className="text-xs text-gray-500 sm:text-right">
                  Gemiddelde reactietijd: {avgResponseHoursText(profile)}
                </p>
              </div>
            </div>

            {/* 3 info-pills */}
            <section aria-label="DJ details">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Clock className="h-4 w-4 text-green-600" aria-hidden />
                    Jaren ervaring
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{experienceLabel}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Music2 className="h-4 w-4 text-green-600" aria-hidden />
                    Apparatuur
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{apparatuurLabel}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Languages className="h-4 w-4 text-green-600" aria-hidden />
                    Taal
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{talenLabel}</p>
                </div>
              </div>
            </section>

            {/* DJ in actie - only when video exists */}
            {hasYouTubeVideo ? (
              <section id="dj-video" className="scroll-mt-24" aria-label="DJ in actie">
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-green-600" aria-hidden />
                  <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                    DJ in actie
                  </h2>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm">
                  <iframe
                    title={`Video van ${name}`}
                    src={`https://www.youtube.com/embed/${encodeURIComponent(
                      youtubeId,
                    )}`}
                    className="w-full aspect-video rounded-2xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            ) : null}

            {/* Muziek & Instagram */}
            {soundcloudUrl || instagramUrl ? (
              <section aria-label="Muziek en Instagram">
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Muziek &amp; Instagram
                </h2>
                <div
                  className={`mt-4 grid gap-6 ${
                    soundcloudUrl && instagramUrl ? "lg:grid-cols-[3fr_2fr]" : "grid-cols-1"
                  }`}
                >
                  {soundcloudUrl ? (
                    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                      <iframe
                        width="100%"
                        height="166"
                        scrolling="no"
                        frameBorder="no"
                        allow="autoplay"
                        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
                          soundcloudUrl,
                        )}&color=%2322c55e&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
                        className="w-full rounded-2xl"
                        title="SoundCloud"
                      />
                    </div>
                  ) : null}

                  {instagramUrl ? (
                    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900">
                            Instagram
                          </p>
                          <p className="mt-1 truncate text-sm text-slate-600">
                            {instagramHandle || instagramUrl}
                          </p>
                        </div>
                        <div
                          className="shrink-0 rounded-xl bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-white/50"
                          aria-hidden
                        >
                          Volg mee
                        </div>
                      </div>
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 ring-1 ring-gray-200 transition hover:bg-white/90"
                      >
                        Volg op Instagram
                      </a>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {/* Waarom bookadj */}
            <section aria-label="Waarom bookadj">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Waarom bookadj
              </h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    Icon: Lock,
                    title: "Veilige betaling",
                    text: "Betaal via het platform met betalingsbescherming.",
                  },
                  {
                    Icon: CheckCircle2,
                    title: "Geverifieerde DJ's",
                    text: "DJ-profielen worden gecontroleerd voordat ze live gaan.",
                  },
                  {
                    Icon: Headset,
                    title: "Klantenservice",
                    text: "Hulp bij vragen, wijzigingen en eventuele problemen.",
                  },
                  {
                    Icon: BadgeCheck,
                    title: "Alles op één plek",
                    text: "Berichten en afspraken overzichtelijk in je account.",
                  },
                ].map(({ Icon, title, text }) => (
                  <li key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <Icon className="h-4 w-4 text-green-600" aria-hidden />
                      {title}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{text}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Booking panel - mobile placement (after bio) */}
            <div id="booking-panel-anchor" className="lg:hidden">
              <BookingPanel
                djId={id}
                djUserId={djUserId || null}
                hourlyRate={hourly}
                homeLat={
                  typeof profile.home_lat === "number" ? profile.home_lat : null
                }
                homeLng={
                  typeof profile.home_lng === "number" ? profile.home_lng : null
                }
                ratePerKm={
                  typeof profile.rate_per_km === "number"
                    ? profile.rate_per_km
                    : null
                }
                contactButtonLabel={`Stel ${fn} een vraag`}
                responseTimeLabel={metaResponse(profile)}
                memberSinceLabel={formatSidebarMemberSince(profile)}
                blockedIsoDates={blockedIsoDates}
              />
            </div>

            <DjUspGrid stageName={displayForBio} items={customUsps} />

            {reviews.length > 0 ? (
              <section aria-labelledby="reviews-heading">
                <h2
                  id="reviews-heading"
                  className="text-xl font-bold text-slate-900 sm:text-2xl"
                >
                  Reviews
                </h2>
                <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
                  <div className="flex shrink-0 flex-col items-center rounded-2xl border border-gray-100 bg-white px-8 py-6 shadow-sm lg:items-start">
                    <p className="text-5xl font-bold text-slate-900">
                      {displayRating.toFixed(1)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      op basis van {totalReviews}{" "}
                      {totalReviews === 1 ? "beoordeling" : "beoordelingen"}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    {([5, 4, 3, 2, 1] as const).map((star) => {
                      const count = dist[star];
                      const pct = Math.round((count / maxBar) * 100);
                      return (
                        <div key={star} className="flex items-center gap-3 text-sm">
                          <span className="flex w-14 items-center gap-1 text-gray-400">
                            {star}
                            <StarSvg filled />
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-green-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-gray-500">{count}</span>
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
                        className="card-interactive min-w-[min(100%,280px)] max-w-xs shrink-0 snap-start p-5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-900">
                            {getReviewAuthor(r)}
                          </p>
                          <StarRow value={rating} size="sm" />
                        </div>
                        {dt ? (
                          <p className="mt-1 text-xs text-gray-500">
                            {dt.toLocaleDateString("nl-NL", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        ) : null}
                        <p className="mt-3 text-sm leading-relaxed text-gray-400">
                          {getReviewBody(r) || "-"}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : (
              <section aria-label="Reviews">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                    <StarIcon className="h-6 w-6 text-green-600" aria-hidden />
                  </div>
                  <p className="mb-2 font-semibold text-gray-900">
                    Nog geen reviews
                  </p>
                  <p className="mx-auto max-w-xs text-sm text-gray-500">
                    Deze DJ is nieuw op bookadj. Wees de eerste die een boeking
                    plaatst en een review achterlaat.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    Geverifieerde DJ
                  </div>
                </div>
              </section>
            )}

            <section aria-labelledby="trust-heading">
              <h2
                id="trust-heading"
                className="text-xl font-bold text-slate-900 sm:text-2xl"
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
                    className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md"
                  >
                    <Icon
                      className="h-8 w-8 shrink-0 text-green-600"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{t}</p>
                      <p className="mt-1 text-sm text-gray-400">{d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <DjHelpSection />
            <DjProfileFaq />
          </div>

          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <BookingPanel
              djId={id}
              djUserId={djUserId || null}
              hourlyRate={hourly}
              homeLat={typeof profile.home_lat === "number" ? profile.home_lat : null}
              homeLng={typeof profile.home_lng === "number" ? profile.home_lng : null}
              ratePerKm={
                typeof profile.rate_per_km === "number" ? profile.rate_per_km : null
              }
              contactButtonLabel={`Stel ${fn} een vraag`}
              responseTimeLabel={metaResponse(profile)}
              memberSinceLabel={formatSidebarMemberSince(profile)}
              blockedIsoDates={blockedIsoDates}
            />
          </aside>
        </div>

        <MobileStickyBookingBar djId={id} />

        <RelatedDjsCarousel djs={relatedDjs} />

        <p className="mt-12 text-center">
          <Link
            href="/zoeken"
            className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-green-600"
          >
            <ArrowLeftLink />
            Terug naar zoeken
          </Link>
        </p>
      </div>
    </div>
  );
}