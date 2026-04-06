"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { EmptyState, ZoekenResultsSkeleton } from "@/components/skeleton";
import {
  getCity,
  getGenres,
  getHourlyRate,
  getProfileRating,
  getReviewCount,
  getStageName,
  type DjProfileRow,
} from "@/lib/dj-profile-helpers";
import {
  OCCASION_OPTIONS,
  occasionLabel,
  profileMatchesOccasion,
} from "@/lib/occasions";
import { supabase } from "@/lib/supabase-browser";

const FILTER_GENRES = [
  "House",
  "Techno",
  "Afro House",
  "Hip-hop",
  "Top 40",
  "Disco",
  "Latin",
] as const;

const ZOEKEN_CARD_IMG =
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80&auto=format&fit=crop";

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
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-bookadj [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:active:cursor-grabbing " +
  "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-bookadj [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:active:cursor-grabbing";

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
      <div className="relative h-10 pt-2">
        <div
          className="pointer-events-none absolute left-0 right-0 top-[calc(50%-2px)] h-px bg-neutral-200"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-[calc(50%-2px)] h-0.5 rounded-full bg-bookadj"
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
          className={`pointer-events-none absolute inset-x-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-bookadj/30 focus-visible:ring-offset-2 ${rangeTrackTransparent} ${rangeThumb}`}
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
          className={`pointer-events-none absolute inset-x-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-bookadj/30 focus-visible:ring-offset-2 ${rangeTrackTransparent} ${rangeThumb}`}
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
  const [occasion, setOccasion] = useState("");

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
    setOccasion(params.get("occasion") ?? "");
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

    const occ = occasion.trim();
    if (occ) {
      list = list.filter((r) => profileMatchesOccasion(r, occ));
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
    occasion,
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
    if (occasion.trim()) params.set("occasion", occasion.trim());
    const q = params.toString();
    window.history.replaceState(null, "", q ? `/zoeken?${q}` : "/zoeken");
  };

  const FilterBlock = (
    <>
      <div className="space-y-2 border-b border-neutral-200 py-6">
        <h2 className="text-sm font-semibold text-neutral-900">Gelegenheid</h2>
        <p className="text-xs text-neutral-500">
          Filter op type feest (secundair naast je zoekbalk).
        </p>
        <select
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          className="input-field mt-2"
          aria-label="Filter op gelegenheid"
        >
          <option value="">Alle gelegenheden</option>
          {OCCASION_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
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
      <Navbar />

      <header className="border-b border-neutral-200 bg-white text-neutral-900 shadow-sm">
        <div className="mx-auto max-w-[1600px]">
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
                className="input-field"
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
                className="input-field"
              />
            </label>
            <label className="flex min-w-[140px] flex-1 flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase text-neutral-500">
                Gelegenheid
              </span>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="input-field"
              >
                <option value="">Alle gelegenheden</option>
                {OCCASION_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="h-11 min-h-[44px] w-full shrink-0 rounded-lg bg-bookadj px-6 text-sm font-semibold text-white transition-all duration-200 hover:bg-bookadj-hover sm:w-auto"
            >
              Zoeken
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:gap-10 lg:px-8">
        <details className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 lg:hidden">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between text-sm font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
            <span>Filters</span>
            <span className="text-xs font-normal text-neutral-500">
              {occasion ? occasionLabel(occasion) : "Geen"}
            </span>
          </summary>
          <div className="mt-4">{FilterBlock}</div>
        </details>

        <aside className="hidden lg:block" aria-label="Filters">
          <div className="card-interactive p-5">
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
                      className="input-field w-full cursor-pointer appearance-none py-0 pl-3 pr-10 font-medium shadow-sm"
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
            <div className="py-6">
              <ZoekenResultsSkeleton />
            </div>
          ) : !error && filteredSorted.length === 0 ? (
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
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
              }
              title="Geen DJ’s voor deze filters"
              description="Pas je stad, datum, gelegenheid, genres of prijs aan — of wis een filter om meer profielen te zien."
            />
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                      className="group card-interactive block h-full overflow-hidden"
                    >
                      <div
                        className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-neutral-900 bg-cover bg-center"
                        style={{ backgroundImage: `url(${ZOEKEN_CARD_IMG})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
                        <span className="absolute left-3 top-3 z-[1] rounded-full bg-bookadj px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                          Geverifieerd
                        </span>
                        <span className="absolute inset-0 z-[1] flex items-center justify-center text-3xl font-bold text-white drop-shadow-md">
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
