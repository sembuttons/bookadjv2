"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCity,
  getGenres,
  getHourlyRate,
  getProfileRating,
  getReviewCount,
  getStageName,
  type DjProfileRow,
} from "@/lib/dj-profile-helpers";
import { supabase } from "@/lib/supabase";

const FILTER_GENRES = [
  "House",
  "Techno",
  "Afro House",
  "Hip-hop",
  "Top 40",
  "Disco",
  "Latin",
] as const;

const PRICE_SLIDER_MIN = 50;
const PRICE_SLIDER_MAX = 350;
const PRICE_STEP = 5;

type SortKey = "best" | "price_asc" | "price_desc" | "rating" | "newest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "best", label: "Beste match" },
  { value: "price_asc", label: "Prijs laag naar hoog" },
  { value: "price_desc", label: "Prijs hoog naar laag" },
  { value: "rating", label: "Hoogste beoordeling" },
  { value: "newest", label: "Nieuwste eerst" },
];

function getCreatedAtMs(row: DjProfileRow): number {
  const c = row.created_at;
  if (typeof c !== "string") return 0;
  const t = Date.parse(c);
  return Number.isNaN(t) ? 0 : t;
}

function initials(name: string) {
  const s = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return s || "DJ";
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSparkleNew({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M8 1.5l1.2 3.5h3.8L10.2 8l1.2 3.5L8 10.5 4.6 11.5 5.8 8 2.5 5H6.2L8 1.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

const rangeThumb =
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:active:cursor-grabbing " +
  "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:active:cursor-grabbing";

const rangeTrackTransparent =
  "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent";

function DualHourlyRateSlider({
  minVal,
  maxVal,
  onMinChange,
  onMaxChange,
}: {
  minVal: number;
  maxVal: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}) {
  const span = PRICE_SLIDER_MAX - PRICE_SLIDER_MIN;
  const leftPct = ((minVal - PRICE_SLIDER_MIN) / span) * 100;
  const widthPct = ((maxVal - minVal) / span) * 100;

  const minZ = minVal > PRICE_SLIDER_MAX - maxVal ? 30 : 20;
  const maxZ = minVal > PRICE_SLIDER_MAX - maxVal ? 20 : 30;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm font-semibold text-neutral-900">
        <span>{`€${minVal}`}</span>
        <span>{`€${maxVal}`}</span>
      </div>

      <div className="relative h-10 pt-2">
        <div
          className="pointer-events-none absolute left-0 right-0 top-[calc(50%-2px)] h-px bg-neutral-200"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-[calc(50%-2px)] h-0.5 rounded-full bg-black"
          style={{
            left: `${leftPct}%`,
            width: `${Math.max(widthPct, 0)}%`,
          }}
          aria-hidden
        />

        <input
          type="range"
          min={PRICE_SLIDER_MIN}
          max={PRICE_SLIDER_MAX}
          step={PRICE_STEP}
          value={minVal}
          onChange={(e) => {
            const v = Number(e.target.value);
            onMinChange(Math.min(v, maxVal - PRICE_STEP));
          }}
          className={`pointer-events-none absolute inset-x-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 ${rangeTrackTransparent} ${rangeThumb}`}
          style={{ zIndex: minZ }}
          aria-label="Minimum uurtarief"
        />
        <input
          type="range"
          min={PRICE_SLIDER_MIN}
          max={PRICE_SLIDER_MAX}
          step={PRICE_STEP}
          value={maxVal}
          onChange={(e) => {
            const v = Number(e.target.value);
            onMaxChange(Math.max(v, minVal + PRICE_STEP));
          }}
          className={`pointer-events-none absolute inset-x-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 ${rangeTrackTransparent} ${rangeThumb}`}
          style={{ zIndex: maxZ }}
          aria-label="Maximum uurtarief"
        />
      </div>

      <div className="flex justify-between text-xs text-neutral-500">
        <span>{`€${PRICE_SLIDER_MIN}`}</span>
        <span>{`€${PRICE_SLIDER_MAX}`}</span>
      </div>
    </div>
  );
}

export default function ZoekenPage() {
  const [stad, setStad] = useState("");
  const [datum, setDatum] = useState("");
  const [genreSearch, setGenreSearch] = useState("");

  const [rows, setRows] = useState<DjProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [genreChecks, setGenreChecks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(FILTER_GENRES.map((g) => [g, false])),
  );
  const [priceMin, setPriceMin] = useState(PRICE_SLIDER_MIN);
  const [priceMax, setPriceMax] = useState(PRICE_SLIDER_MAX);
  const [sort, setSort] = useState<SortKey>("best");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setStad(params.get("stad") ?? "");
    setDatum(params.get("datum") ?? "");
    setGenreSearch(params.get("genre") ?? "");
  }, []);

  const loadDjs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: djs, error: err } = await supabase
      .from("dj_profiles")
      .select("*")
      .eq("is_visible", true)
      .eq("verification_status", "verified");

    if (err) {
      setError(err.message);
      setRows([]);
    } else {
      setRows((djs as DjProfileRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDjs();
  }, [loadDjs]);

  const selectedGenres = useMemo(
    () => FILTER_GENRES.filter((g) => genreChecks[g]),
    [genreChecks],
  );

  const filteredSorted = useMemo(() => {
    let list = [...rows];

    const stadQ = stad.trim().toLowerCase();
    if (stadQ) {
      list = list.filter((r) => getCity(r).toLowerCase().includes(stadQ));
    }

    const gq = genreSearch.trim().toLowerCase();
    if (gq) {
      list = list.filter((r) =>
        getGenres(r).some((x) => x.toLowerCase().includes(gq)),
      );
    }

    if (selectedGenres.length > 0) {
      list = list.filter((r) => {
        const gs = getGenres(r).map((x) => x.toLowerCase());
        return selectedGenres.some((f) =>
          gs.some(
            (x) =>
              x.includes(f.toLowerCase()) ||
              f.toLowerCase().includes(x),
          ),
        );
      });
    }

    list = list.filter((r) => {
      const rate = getHourlyRate(r);
      if (rate == null) return true;
      return rate >= priceMin && rate <= priceMax;
    });

    const score = (r: DjProfileRow) => {
      const rating = getProfileRating(r);
      const n = getReviewCount(r);
      return rating * Math.log10(n + 10);
    };

    list.sort((a, b) => {
      switch (sort) {
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
        case "rating":
          return getProfileRating(b) - getProfileRating(a);
        case "newest":
          return getCreatedAtMs(b) - getCreatedAtMs(a);
        case "best":
        default:
          return score(b) - score(a);
      }
    });

    return list;
  }, [
    rows,
    stad,
    genreSearch,
    selectedGenres,
    priceMin,
    priceMax,
    sort,
  ]);

  const handleZoeken = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (stad.trim()) params.set("stad", stad.trim());
    if (datum) params.set("datum", datum);
    if (genreSearch.trim()) params.set("genre", genreSearch.trim());
    const q = params.toString();
    window.history.replaceState(null, "", q ? `/zoeken?${q}` : "/zoeken");
  };

  const FilterBlock = (
    <>
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
                  onChange={() =>
                    setGenreChecks((p) => ({ ...p, [g]: !p[g] }))
                  }
                />
                {g}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="space-y-2 border-b border-neutral-200 py-6">
        <h2 className="text-sm font-semibold text-neutral-900">
          Uurtarief (€)
        </h2>
        <p className="text-xs text-neutral-500">
          Toon DJ&apos;s met uurtarief binnen dit bereik. Profielen zonder
          tarief blijven zichtbaar.
        </p>
        <DualHourlyRateSlider
          minVal={priceMin}
          maxVal={priceMax}
          onMinChange={setPriceMin}
          onMaxChange={setPriceMax}
        />
      </div>
    </>
  );

  const resultCount = filteredSorted.length;

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <header className="border-b border-white/10 bg-black text-white shadow-sm">
        <div className="relative mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0 text-xl font-semibold tracking-tight">
            bookadj
          </Link>
          <nav className="order-last flex w-full justify-center gap-6 text-sm font-medium text-white/90 md:order-none md:absolute md:left-1/2 md:w-auto md:-translate-x-1/2 md:gap-8">
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
            <Link href="/auth" className="text-sm font-medium text-white/90 hover:text-white">
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

        <div className="border-t border-white/10 bg-white text-neutral-900">
          <form
            onSubmit={handleZoeken}
            className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 sm:px-6 lg:px-8"
          >
            <label className="flex min-w-[140px] flex-1 flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase text-neutral-500">
                Stad
              </span>
              <input
                value={stad}
                onChange={(e) => setStad(e.target.value)}
                placeholder="Bijv. Amsterdam"
                className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="flex min-w-[140px] flex-1 flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase text-neutral-500">
                Datum
              </span>
              <input
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="flex min-w-[140px] flex-1 flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase text-neutral-500">
                Genre
              </span>
              <select
                value={genreSearch}
                onChange={(e) => setGenreSearch(e.target.value)}
                className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
              >
                <option value="">Alle genres</option>
                {FILTER_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="h-[42px] shrink-0 rounded-lg bg-black px-6 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Zoeken
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:gap-10 lg:px-8">
        <details className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 lg:hidden">
          <summary className="cursor-pointer text-sm font-semibold">Filters</summary>
          <div className="mt-4">{FilterBlock}</div>
        </details>

        <aside className="hidden lg:block" aria-label="Filters">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold">Filters</h2>
            {FilterBlock}
          </div>
        </aside>

        <div className="min-w-0">
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {!loading && !error ? (
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-neutral-700">
                <span className="font-semibold text-neutral-900">
                  {resultCount}
                </span>
                {resultCount === 1
                  ? " resultaat"
                  : " resultaten"}
              </p>
              <div className="relative flex min-w-0 flex-1 items-center justify-end sm:max-w-md sm:flex-initial">
                <label className="flex w-full cursor-pointer items-center gap-2 text-sm text-neutral-700 sm:w-auto">
                  <span className="shrink-0 whitespace-nowrap">
                    Sorteren op:
                  </span>
                  <span className="relative inline-flex min-w-0 flex-1 items-center sm:min-w-[220px]">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      aria-label="Sorteer resultaten"
                      className="w-full cursor-pointer appearance-none rounded-lg border border-neutral-200 bg-white py-2.5 pl-3 pr-10 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:border-neutral-300 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  </span>
                </label>
              </div>
            </div>
          ) : null}

          {loading ? (
            <p className="py-16 text-center text-neutral-600">Laden…</p>
          ) : !error && filteredSorted.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-neutral-600">
              Geen DJ&apos;s gevonden
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredSorted.map((row) => {
                const id = String(row.id);
                const stage = getStageName(row);
                const city = getCity(row);
                const genres = getGenres(row);
                const rate = getHourlyRate(row);
                return (
                  <li key={id}>
                    <Link
                      href={`/dj/${encodeURIComponent(id)}`}
                      className="group block h-full rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-gradient-to-br from-neutral-800 to-black">
                        <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          Geverifieerd
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white/90">
                          {initials(stage)}
                        </span>
                      </div>
                      <div className="space-y-2 p-4">
                        <h3 className="text-lg font-semibold group-hover:underline">
                          {stage}
                        </h3>
                        <p className="text-sm text-neutral-600">{city}</p>
                        <div className="flex flex-wrap gap-2">
                          {genres.slice(0, 4).map((g) => (
                            <span
                              key={g}
                              className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                          <p className="font-bold text-neutral-900">
                            {rate != null
                              ? `v.a. €${rate.toLocaleString("nl-NL")}/uur`
                              : "Tarief op aanvraag"}
                          </p>
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                            <IconSparkleNew className="shrink-0 text-amber-500" />
                            Nieuw
                          </span>
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
