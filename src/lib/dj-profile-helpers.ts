export type DjProfileRow = Record<string, unknown> & { id: string };
export type ReviewRow = Record<string, unknown>;

export function getDisplayName(row: DjProfileRow): string {
  const stage = row.stage_name;
  const display = row.display_name;
  const full = row.full_name;
  if (typeof stage === "string" && stage.trim()) return stage.trim();
  if (typeof display === "string" && display.trim()) return display.trim();
  if (typeof full === "string" && full.trim()) return full.trim();
  return "DJ";
}

/** Prefer `stage_name` for public-facing DJ brand; fallback to display name. */
export function getStageName(row: DjProfileRow): string {
  const s = row.stage_name;
  if (typeof s === "string" && s.trim()) return s.trim();
  return getDisplayName(row);
}

export function getCity(row: DjProfileRow): string {
  const c = row.city;
  return typeof c === "string" ? c : "-";
}

export function getHourlyRate(row: DjProfileRow): number | null {
  const v =
    row.hourly_rate ??
    row.hourly_rate_min ??
    row.rate_per_hour ??
    row.base_hourly_rate;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

export function getGenres(row: DjProfileRow): string[] {
  const g = row.genres ?? row.genre_tags ?? row.music_genres;
  if (Array.isArray(g)) {
    return g.filter((x): x is string => typeof x === "string");
  }
  if (typeof g === "string" && g.trim()) {
    return g.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function getYearsExperience(row: DjProfileRow): number | null {
  const y =
    row.years_experience ?? row.experience_years ?? row.years_of_experience;
  if (typeof y === "number" && !Number.isNaN(y)) return y;
  if (typeof y === "string") {
    const n = parseInt(y, 10);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

export function getProfileRating(row: DjProfileRow): number {
  const r =
    row.average_rating ?? row.rating_average ?? row.avg_rating ?? row.rating;
  if (typeof r === "number" && !Number.isNaN(r)) return r;
  if (typeof r === "string") {
    const n = parseFloat(r);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

export function getReviewCount(row: DjProfileRow): number {
  const n =
    row.review_count ?? row.reviews_count ?? row.number_of_reviews ?? 0;
  if (typeof n === "number" && !Number.isNaN(n)) return Math.max(0, n);
  if (typeof n === "string") {
    const x = parseInt(n, 10);
    return Number.isNaN(x) ? 0 : Math.max(0, x);
  }
  return 0;
}

export function isVerifiedProfile(row: DjProfileRow): boolean {
  return row.verification_status === "verified";
}

export function getBio(row: DjProfileRow): string {
  const b = row.bio ?? row.description ?? row.about;
  if (typeof b === "string" && b.trim()) return b.trim();
  return "";
}

export function getReviewRating(r: ReviewRow): number {
  const v = r.rating ?? r.stars ?? r.score;
  if (typeof v === "number" && !Number.isNaN(v)) return Math.min(5, Math.max(0, v));
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : Math.min(5, Math.max(0, n));
  }
  return 0;
}

export function getReviewBody(r: ReviewRow): string {
  const t = r.comment ?? r.body ?? r.text ?? r.review_text;
  return typeof t === "string" ? t : "";
}

export function getReviewAuthor(r: ReviewRow): string {
  const a =
    r.author_name ??
    r.customer_name ??
    r.reviewer_name ??
    r.user_display_name;
  return typeof a === "string" && a.trim() ? a.trim() : "Klant";
}

export function getReviewDate(r: ReviewRow): Date | null {
  const d = r.created_at ?? r.createdAt;
  if (typeof d === "string") {
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  return null;
}

export function averageFromReviews(reviews: ReviewRow[]): number {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((s, r) => s + getReviewRating(r), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function starDistribution(reviews: ReviewRow[]): Record<1 | 2 | 3 | 4 | 5, number> {
  const dist: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  for (const r of reviews) {
    const raw = getReviewRating(r);
    const rounded = Math.min(5, Math.max(1, Math.round(raw))) as 1 | 2 | 3 | 4 | 5;
    dist[rounded] += 1;
  }
  return dist;
}

/** Public photo URLs from `dj_profiles.photos` jsonb (max 6). */
export function getProfilePhotoUrls(row: DjProfileRow): string[] {
  const p = row.photos;
  if (!Array.isArray(p)) return [];
  return p
    .filter((x): x is string => typeof x === "string" && Boolean(x.trim()))
    .map((s) => s.trim())
    .slice(0, 6);
}

/** Label for search cards / UI, e.g. "Binnen 2 uur". */
export function getResponseTimeLabel(row: DjProfileRow): string {
  const h = row.response_time_hours ?? row.avg_response_hours;
  if (typeof h === "number" && !Number.isNaN(h)) return `Binnen ${h} uur`;
  if (typeof h === "string" && h.trim()) return h.trim();
  return "Binnen 2 uur";
}
