"use client";

import Link from "next/link";
import {
  Briefcase,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Loader2,
  MoreHorizontal,
  Music,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

const GENRES = [
  "House",
  "Techno",
  "Afro House",
  "Hip-hop",
  "Top 40",
  "Disco",
  "Latin",
  "Drum & Bass",
  "R&B",
  "Hardstyle",
  "Trance",
  "Reggaeton",
  "Funk",
  "Soul",
  "Jazz",
  "Pop",
  "Dance",
  "EDM",
  "Dubstep",
  "Garage",
  "UK Garage",
  "Amapiano",
  "Dancehall",
  "Afrobeats",
  "Commercial",
  "Oldskool",
  "Classics",
  "Nederlandstalig",
] as const;

const OCCASIONS = [
  "Bruiloft",
  "Verjaardag",
  "Bedrijfsfeest",
  "Club & Bar",
  "Festival",
  "Huisfeest",
  "Afstuderen",
  "Studentenfeest",
  "Sportgala",
  "Buurtfeest",
  "Kerst",
  "Oud en nieuw",
  "Anders",
] as const;

const LANGUAGES = [
  "Nederlands",
  "Engels",
  "Frans",
  "Duits",
  "Spaans",
  "Italiaans",
  "Arabisch",
] as const;

function initialsFromName(name: string) {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "");
  return parts.join("") || "DJ";
}

function normalizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string" && Boolean(x.trim()));
}

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

export default function DjProfielPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [djProfileId, setDjProfileId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const [stageName, setStageName] = useState("");
  const [bio, setBio] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [hourlyRate, setHourlyRate] = useState<number | "">("");
  const [yearsExperience, setYearsExperience] = useState<number | "">("");
  const [genres, setGenres] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [extraLanguages, setExtraLanguages] = useState("");

  const firstPhoto = photos[0] ?? null;
  const displayNameForAvatar = useMemo(() => stageName.trim() || "DJ", [stageName]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setLoading(false);
      setError("Geen sessie.");
      return;
    }

    const { data: profile, error: pe } = await supabase
      .from("dj_profiles")
      .select(
        "id, stage_name, bio, home_city, hourly_rate, years_experience, genres, occasions, languages, extra_languages, photos",
      )
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (pe) {
      setError(pe.message);
      setLoading(false);
      return;
    }

    if (!profile?.id) {
      setDjProfileId(null);
      setPhotos([]);
      setLoading(false);
      return;
    }

    setDjProfileId(profile.id as string);
    setStageName(typeof profile.stage_name === "string" ? profile.stage_name : "");
    setBio(typeof profile.bio === "string" ? profile.bio : "");
    setHomeCity(typeof profile.home_city === "string" ? profile.home_city : "");
    setHourlyRate(typeof profile.hourly_rate === "number" ? profile.hourly_rate : "");
    setYearsExperience(
      typeof profile.years_experience === "number" ? profile.years_experience : "",
    );
    setGenres(normalizeStringArray(profile.genres));
    setOccasions(normalizeStringArray(profile.occasions));
    setLanguages(normalizeStringArray(profile.languages));
    setExtraLanguages(
      typeof (profile as any).extra_languages === "string"
        ? (profile as any).extra_languages
        : "",
    );
    setPhotos(Array.isArray(profile.photos) ? (profile.photos as string[]) : []);

    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setSaving(false);
      setError("Geen sessie.");
      return;
    }

    const payload: Record<string, unknown> = {
      user_id: session.user.id,
      stage_name: stageName.trim() || null,
      bio: bio.trim() || null,
      home_city: homeCity.trim() || null,
      hourly_rate: hourlyRate === "" ? null : hourlyRate,
      years_experience: yearsExperience === "" ? null : yearsExperience,
      genres,
      occasions,
      languages,
      extra_languages: extraLanguages.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error: up } = await supabase.from("dj_profiles").upsert(payload, {
      onConflict: "user_id",
    });

    setSaving(false);
    if (up) {
      setError(up.message);
      return;
    }

    setSuccess("Profiel opgeslagen");
    window.setTimeout(() => setSuccess(null), 3000);
    await load();
  }, [
    bio,
    extraLanguages,
    genres,
    homeCity,
    hourlyRate,
    languages,
    load,
    occasions,
    stageName,
    yearsExperience,
  ]);

  const toggleGenre = useCallback((g: string) => {
    setGenres((prev) => toggleInList(prev, g));
  }, []);

  const toggleOccasion = useCallback((o: string) => {
    setOccasions((prev) => toggleInList(prev, o));
  }, []);

  const toggleLanguage = useCallback((l: string) => {
    setLanguages((prev) => toggleInList(prev, l));
  }, []);

  if (loading) {
    return (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Mijn profiel
        </h1>
        <p className="mt-2 text-sm text-gray-500">Laden…</p>
      </>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Mijn profiel
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Werk je profiel bij. Dit wordt gebruikt op je openbare DJ-pagina.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {success}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Profielfoto</p>
          <p className="mt-1 text-sm text-gray-500">
            Toon je eerste foto op je profiel.
          </p>

          <div className="mt-5">
            {firstPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={firstPhoto}
                alt=""
                className="h-32 w-32 rounded-2xl object-cover ring-1 ring-gray-200"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-green-50 text-2xl font-black text-green-700 ring-1 ring-green-100">
                {initialsFromName(displayNameForAvatar)}
              </div>
            )}
          </div>

          <Link
            href="/dashboard/dj/media"
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Foto&apos;s beheren
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-1 block">
                Artiestennaam
              </span>
              <input
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 w-full focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                placeholder="Bijv. DJ Nova"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-1 block">
                Stad
              </span>
              <input
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 w-full focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                placeholder="Bijv. Amsterdam"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-gray-700 mb-1 block">
                Bio
              </span>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 w-full focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                placeholder="Vertel iets over je stijl, ervaring en wat klanten kunnen verwachten…"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-1 block">
                Uurtarief
              </span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  €
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={hourlyRate}
                  onChange={(e) =>
                    setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="border border-gray-200 rounded-xl px-4 py-3 pl-9 text-gray-900 w-full focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                  placeholder="125"
                  min={0}
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-1 block">
                Jaren ervaring
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={yearsExperience}
                onChange={(e) =>
                  setYearsExperience(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 w-full focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                placeholder="5"
                min={0}
              />
            </label>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 mb-1">Genres</legend>
              <p className="text-xs text-gray-500 mb-3">
                Selecteer alle genres die op jou van toepassing zijn.
              </p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-2xl p-3">
                {GENRES.map((g) => {
                  const selected = genres.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
                        selected
                          ? "bg-green-500 border-green-500 text-black"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 mb-1">Gelegenheden</legend>
              <p className="text-xs text-gray-500 mb-3">
                Voor welke gelegenheden ben je beschikbaar?
              </p>
              <div className="flex flex-wrap gap-2 border border-gray-200 rounded-2xl p-3">
                {OCCASIONS.map((o) => {
                  const selected = occasions.includes(o);
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => toggleOccasion(o)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
                        selected
                          ? "bg-green-500 border-green-500 text-black"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 mb-1">
                Talen
              </legend>
              <p className="text-xs text-gray-500 mb-3">Welke talen spreek je?</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => {
                  const selected = languages.includes(l);
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleLanguage(l)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        selected
                          ? "bg-green-500 border-green-500 text-black"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-gray-900 mb-1 block">
                  Extra talen
                </span>
                <input
                  value={extraLanguages}
                  onChange={(e) => setExtraLanguages(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 w-full focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                  placeholder="Bijv. Spaans, Italiaans…"
                />
              </label>
            </fieldset>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="bg-green-500 text-black font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Opslaan…
                </>
              ) : (
                "Opslaan"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
