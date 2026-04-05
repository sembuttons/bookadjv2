"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getCity, getGenres, getHourlyRate, getProfileRating, getReviewCount, getStageName } from "@/lib/dj-profile-helpers";
import type { DjProfileRow } from "@/lib/dj-profile-helpers";
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

type SortKey = "best" | "price_asc" | "price_desc" | "rating";

function initials(name: string) {
  const s = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return s || "DJ";
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
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500);
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

      <div className="space-y-4 border-b border-neutral-200 py-6">
        <h2 className="text-sm font-semibold text-neutral-900">Uurtarief (€)</h2>
        <label className="block text-xs text-neutral-500">
          Minimum
          <input
            type="number"
            min={0}
            value={priceMin}
            onChange={(e) =>
              setPriceMin(Math.max(0, Number(e.target.value) || 0))
            }
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs text-neutral-500">
          Maximum
          <input
            type="number"
            min={0}
            value={priceMax}
            onChange={(e) =>
              setPriceMax(Math.max(0, Number(e.target.value) || 0))
            }
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="py-6">
        <label className="block text-sm font-semibold text-neutral-900">
          Sorteren
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
        >
          <option value="best">Beste match</option>
          <option value="price_asc">Prijs laag → hoog</option>
          <option value="price_desc">Prijs hoog → laag</option>
          <option value="rating">Beoordeling</option>
        </select>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white shadow-sm">
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
          <div className="sticky top-36 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
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
                          <span className="text-sm text-amber-500">★ Nieuw</span>
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
