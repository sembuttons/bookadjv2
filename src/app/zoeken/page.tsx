"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

/** Shape returned by SELECT * — map common column name variants in helpers below. */
type DjProfileRow = Record<string, unknown> & { id: string };

const FILTER_GENRES = [
  "House",
  "Techno",
  "Afro House",
  "Hip-hop",
  "Top 40",
  "Disco",
] as const;

const PRICE_MIN = 50;
const PRICE_MAX = 350;

function getDisplayName(row: DjProfileRow): string {
  const stage = row.stage_name;
  const display = row.display_name;
  const full = row.full_name;
  if (typeof stage === "string" && stage.trim()) return stage.trim();
  if (typeof display === "string" && display.trim()) return display.trim();
  if (typeof full === "string" && full.trim()) return full.trim();
  return "DJ";
}

function getCity(row: DjProfileRow): string {
  const c = row.city;
  return typeof c === "string" ? c : "—";
}

function getHourlyRate(row: DjProfileRow): number | null {
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

function getGenres(row: DjProfileRow): string[] {
  const g = row.genres ?? row.genre_tags ?? row.music_genres;
  if (Array.isArray(g)) {
    return g.filter((x): x is string => typeof x === "string");
  }
  if (typeof g === "string" && g.trim()) {
    return g.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function getYearsExperience(row: DjProfileRow): number | null {
  const y =
    row.years_experience ?? row.experience_years ?? row.years_of_experience;
  if (typeof y === "number" && !Number.isNaN(y)) return y;
  if (typeof y === "string") {
    const n = parseInt(y, 10);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function getRating(row: DjProfileRow): number {
  const r =
    row.average_rating ?? row.rating_average ?? row.avg_rating ?? row.rating;
  if (typeof r === "number" && !Number.isNaN(r)) return r;
  if (typeof r === "string") {
    const n = parseFloat(r);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function getReviewCount(row: DjProfileRow): number {
  const n =
    row.review_count ?? row.reviews_count ?? row.number_of_reviews ?? 0;
  if (typeof n === "number" && !Number.isNaN(n)) return Math.max(0, n);
  if (typeof n === "string") {
    const x = parseInt(n, 10);
    return Number.isNaN(x) ? 0 : Math.max(0, x);
  }
  return 0;
}

function getIsAvailable(row: DjProfileRow): boolean {
  const v = row.is_available ?? row.available;
  return v === true;
}

function isVerifiedProfile(row: DjProfileRow): boolean {
  return row.verification_status === "verified";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "DJ";
}

function StarRow({ value }: { value: number }) {
  const full = Math.min(5, Math.round(value));
  return (
    <span className="flex gap-0.5 text-amber-400" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? "" : "text-neutral-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

type SortMode = "best_match" | "rating_desc" | "price_asc" | "price_desc";

type RatingFilter = "all" | "5" | "4" | "3";

export default function ZoekenPage() {
  const [stad, setStad] = useState("");
  const [datum, setDatum] = useState("");
  const [genreSearch, setGenreSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("best_match");

  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(true);
  const [genreChecks, setGenreChecks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(FILTER_GENRES.map((g) => [g, false])),
  );
  const [priceMin, setPriceMin] = useState(PRICE_MIN);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [ratingMin, setRatingMin] = useState<RatingFilter>("all");
  const [exp1_3, setExp1_3] = useState(false);
  const [exp3_7, setExp3_7] = useState(false);
  const [exp7plus, setExp7plus] = useState(false);

  const [rows, setRows] = useState<DjProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setStad(params.get("stad") ?? "");
    setDatum(params.get("datum") ?? "");
    setGenreSearch(params.get("genre") ?? "");
  }, []);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    let q = supabase.from("dj_profiles").select("*").eq("is_visible", true);

    if (onlyVerified) {
      q = q.eq("verification_status", "verified");
    }

    if (onlyAvailable) {
      q = q.eq("is_available", true);
    }

    const { data, error } = await q;

    if (error) {
      setFetchError(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data as DjProfileRow[]) ?? []);
    setLoading(false);
  }, [onlyAvailable, onlyVerified]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const selectedGenreFilters = useMemo(
    () => FILTER_GENRES.filter((g) => genreChecks[g]),
    [genreChecks],
  );

  const experienceFilterActive = exp1_3 || exp3_7 || exp7plus;

  const filteredSorted = useMemo(() => {
    let list = [...rows];

    const stadQ = stad.trim().toLowerCase();
    if (stadQ) {
      list = list.filter((r) => getCity(r).toLowerCase().includes(stadQ));
    }

    const genreQ = genreSearch.trim();
    if (genreQ) {
      list = list.filter((r) =>
        getGenres(r).some((g) =>
          g.toLowerCase().includes(genreQ.toLowerCase()),
        ),
      );
    }

    if (selectedGenreFilters.length > 0) {
      list = list.filter((r) => {
        const gs = getGenres(r).map((x) => x.toLowerCase());
        return selectedGenreFilters.some((f) =>
          gs.some((g) => g.includes(f.toLowerCase()) || f.toLowerCase().includes(g)),
        );
      });
    }

    list = list.filter((r) => {
      const rate = getHourlyRate(r);
      if (rate == null) return true;
      return rate >= priceMin && rate <= priceMax;
    });

    if (ratingMin !== "all") {
      const min = parseFloat(ratingMin);
      list = list.filter((r) => getRating(r) >= min - 0.001);
    }

    if (experienceFilterActive) {
      list = list.filter((r) => {
        const y = getYearsExperience(r);
        if (y == null) return false;
        if (exp1_3 && y >= 1 && y <= 3) return true;
        if (exp3_7 && y > 3 && y <= 7) return true;
        if (exp7plus && y > 7) return true;
        return false;
      });
    }

    const score = (r: DjProfileRow) => {
      const rating = getRating(r);
      const reviews = getReviewCount(r);
      return rating * Math.log10(reviews + 10);
    };

    list.sort((a, b) => {
      switch (sort) {
        case "rating_desc":
          return getRating(b) - getRating(a);
        case "price_asc": {
          const pa = getHourlyRate(a) ?? 99999;
          const pb = getHourlyRate(b) ?? 99999;
          return pa - pb;
        }
        case "price_desc": {
          const pa = getHourlyRate(a) ?? 0;
          const pb = getHourlyRate(b) ?? 0;
          return pb - pa;
        }
        case "best_match":
        default:
          return score(b) - score(a);
      }
    });

    return list;
  }, [
    rows,
    stad,
    genreSearch,
    selectedGenreFilters,
    priceMin,
    priceMax,
    ratingMin,
    experienceFilterActive,
    exp1_3,
    exp3_7,
    exp7plus,
    sort,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (stad.trim()) params.set("stad", stad.trim());
    if (datum) params.set("datum", datum);
    if (genreSearch.trim()) params.set("genre", genreSearch.trim());
    const q = params.toString();
    window.history.replaceState(null, "", q ? `/zoeken?${q}` : "/zoeken");
  };

  const syncPriceMin = (v: number) => {
    const x = Math.min(Math.max(v, PRICE_MIN), PRICE_MAX);
    setPriceMin((prev) => (x > priceMax ? Math.min(x, priceMax) : x));
  };

  const syncPriceMax = (v: number) => {
    const x = Math.min(Math.max(v, PRICE_MIN), PRICE_MAX);
    setPriceMax((prev) => (x < priceMin ? Math.max(x, priceMin) : x));
  };

  const toggleGenre = (g: string) => {
    setGenreChecks((prev) => ({ ...prev, [g]: !prev[g] }));
  };

  const FilterFields = (
    <>
      <div className="space-y-3 border-b border-neutral-200 pb-6">
        <h2 className="text-sm font-semibold text-neutral-900">Beschikbaarheid</h2>
        <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-neutral-700">
          <span>Alleen beschikbaar</span>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-neutral-300"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
          />
        </label>
      </div>

      <div className="space-y-3 border-b border-neutral-200 py-6">
        <h2 className="text-sm font-semibold text-neutral-900">Verificatie</h2>
        <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-neutral-700">
          <span>Alleen geverifieerd</span>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-neutral-300"
            checked={onlyVerified}
            onChange={(e) => setOnlyVerified(e.target.checked)}
          />
        </label>
      </div>

      <fieldset className="space-y-3 border-b border-neutral-200 py-6">
        <legend className="text-sm font-semibold text-neutral-900">Genre</legend>
        <ul className="space-y-2">
          {FILTER_GENRES.map((g) => (
            <li key={g}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300"
                  checked={genreChecks[g] ?? false}
                  onChange={() => toggleGenre(g)}
                />
                {g}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="space-y-4 border-b border-neutral-200 py-6">
        <h2 className="text-sm font-semibold text-neutral-900">Uurtarief</h2>
        <p className="text-xs text-neutral-500">
          €{priceMin} – €{priceMax} per uur
        </p>
        <div className="space-y-2">
          <label className="block text-xs text-neutral-500">Minimum</label>
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={5}
            value={priceMin}
            onChange={(e) => syncPriceMin(Number(e.target.value))}
            className="w-full accent-black"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs text-neutral-500">Maximum</label>
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={5}
            value={priceMax}
            onChange={(e) => syncPriceMax(Number(e.target.value))}
            className="w-full accent-black"
          />
        </div>
      </div>

      <fieldset className="space-y-3 border-b border-neutral-200 py-6">
        <legend className="text-sm font-semibold text-neutral-900">
          Minimale beoordeling
        </legend>
        {(
          [
            { v: "5" as const, label: "5,0" },
            { v: "4" as const, label: "4,0+" },
            { v: "3" as const, label: "3,0+" },
            { v: "all" as const, label: "Alle" },
          ] as const
        ).map(({ v, label }) => (
          <label
            key={v}
            className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
          >
            <input
              type="radio"
              name="ratingMin"
              className="h-4 w-4 border-neutral-300"
              checked={ratingMin === v}
              onChange={() => setRatingMin(v)}
            />
            {label}
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-3 py-6">
        <legend className="text-sm font-semibold text-neutral-900">Ervaring</legend>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-neutral-300"
            checked={exp1_3}
            onChange={(e) => setExp1_3(e.target.checked)}
          />
          1–3 jaar
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-neutral-300"
            checked={exp3_7}
            onChange={(e) => setExp3_7(e.target.checked)}
          />
          3–7 jaar
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-neutral-300"
            checked={exp7plus}
            onChange={(e) => setExp7plus(e.target.checked)}
          />
          7+ jaar
        </label>
      </fieldset>
    </>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white shadow-sm">
        <div className="relative mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
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
            <Link href="/#zoeken" className="hover:text-white">
              DJ&apos;s vinden
            </Link>
            <Link href="/#hoe-het-werkt" className="hover:text-white">
              Hoe het werkt
            </Link>
            <Link href="/#voor-djs" className="hover:text-white">
              Voor DJ&apos;s
            </Link>
          </nav>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/auth"
              className="text-sm font-medium text-white/90 hover:text-white"
            >
              Inloggen
            </Link>
            <Link
              href="/auth?tab=aanmelden"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
            >
              Aanmelden
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white text-neutral-900">
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:flex-wrap lg:items-end lg:gap-4 lg:px-8"
          >
            <label className="flex min-w-[140px] flex-1 flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Stad
              </span>
              <input
                type="text"
                value={stad}
                onChange={(e) => setStad(e.target.value)}
                placeholder="Bijv. Amsterdam"
                className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
              />
            </label>
            <label className="flex min-w-[140px] flex-1 flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Datum
              </span>
              <input
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
              />
            </label>
            <label className="flex min-w-[140px] flex-1 flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Genre
              </span>
              <select
                value={genreSearch}
                onChange={(e) => setGenreSearch(e.target.value)}
                className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
              >
                <option value="">Alle genres</option>
                {[...FILTER_GENRES, "Latin"].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex min-w-[160px] flex-1 flex-col gap-1.5 lg:max-w-[200px]">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Sorteren
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
              >
                <option value="best_match">Beste match</option>
                <option value="rating_desc">Hoogste beoordeling</option>
                <option value="price_asc">Prijs: laag → hoog</option>
                <option value="price_desc">Prijs: hoog → laag</option>
              </select>
            </div>
            <button
              type="submit"
              className="h-[42px] w-full shrink-0 rounded-lg bg-black px-6 text-sm font-semibold text-white hover:bg-neutral-800 lg:w-auto"
            >
              Zoeken
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-10 lg:px-8">
        <details className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 lg:hidden">
          <summary className="cursor-pointer text-sm font-semibold text-neutral-900">
            Filters
          </summary>
          <div className="mt-4">{FilterFields}</div>
        </details>

        <aside
          className="hidden w-full max-w-[260px] shrink-0 lg:block"
          aria-label="Filters"
        >
          <div className="sticky top-[200px] rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-neutral-900">Filters</h2>
            {FilterFields}
          </div>
        </aside>

        <div className="min-w-0">
          {fetchError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Kon DJ-profielen niet laden: {fetchError}
            </p>
          ) : null}

          {loading ? (
            <p className="py-16 text-center text-neutral-600">Laden…</p>
          ) : !fetchError && filteredSorted.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-neutral-600">
              Geen DJ&apos;s gevonden
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredSorted.map((row) => {
                const name = getDisplayName(row);
                const rate = getHourlyRate(row);
                const genres = getGenres(row);
                const rating = getRating(row);
                const reviews = getReviewCount(row);
                const years = getYearsExperience(row);
                const available = getIsAvailable(row);
                const id = String(row.id);

                return (
                  <li key={id}>
                    <Link
                      href={`/dj/${encodeURIComponent(id)}`}
                      className="group block h-full rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-gradient-to-br from-neutral-700 via-neutral-900 to-black">
                        {isVerifiedProfile(row) ? (
                          <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                            Geverifieerd
                          </span>
                        ) : null}
                        <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white/90">
                          {initials(name)}
                        </span>
                      </div>
                      <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-semibold text-neutral-900 group-hover:underline">
                            {name}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <StarRow value={rating} />
                          <span className="font-medium text-neutral-800">
                            {rating.toFixed(1)}
                          </span>
                          <span className="text-neutral-500">
                            ({reviews}{" "}
                            {reviews === 1 ? "beoordeling" : "beoordelingen"})
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600">
                          {getCity(row)}
                          {years != null ? (
                            <span className="text-neutral-400">
                              {" "}
                              · {years} jaar ervaring
                            </span>
                          ) : null}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {genres.slice(0, 4).map((g) => (
                            <span
                              key={g}
                              className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3">
                          <p className="text-base font-bold text-neutral-900">
                            {rate != null
                              ? `v.a. €${rate.toLocaleString("nl-NL")}/uur`
                              : "Tarief op aanvraag"}
                          </p>
                          {available ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
                              <span className="text-emerald-600" aria-hidden>
                                ✓
                              </span>
                              Beschikbaar
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
