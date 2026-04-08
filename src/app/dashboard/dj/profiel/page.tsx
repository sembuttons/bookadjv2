"use client";

import Link from "next/link";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
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

const EQUIPMENT_PRESETS = [
  "Controller",
  "Pioneer CDJ setup",
  "Speakers",
  "Subwoofer",
  "Lichtshow",
  "Microfoon",
  "Mengpaneel",
  "Laptop",
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
  const [customGenre, setCustomGenre] = useState("");
  const [customOccasion, setCustomOccasion] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [customEquipment, setCustomEquipment] = useState("");

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
        "id, stage_name, bio, home_city, hourly_rate, years_experience, genres, custom_genres, occasions, custom_occasions, languages, extra_languages, photos, equipment, custom_equipment",
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
    setCustomGenre(
      typeof (profile as any).custom_genres === "string"
        ? (profile as any).custom_genres
        : "",
    );
    setOccasions(normalizeStringArray(profile.occasions));
    setCustomOccasion(
      typeof (profile as any).custom_occasions === "string"
        ? (profile as any).custom_occasions
        : "",
    );
    setLanguages(normalizeStringArray(profile.languages));
    setExtraLanguages(
      typeof (profile as any).extra_languages === "string"
        ? (profile as any).extra_languages
        : "",
    );
    setPhotos(Array.isArray(profile.photos) ? (profile.photos as string[]) : []);
    setEquipment(normalizeStringArray((profile as { equipment?: unknown }).equipment));
    setCustomEquipment(
      typeof (profile as { custom_equipment?: unknown }).custom_equipment === "string"
        ? (profile as { custom_equipment: string }).custom_equipment
        : "",
    );

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
      custom_genres: customGenre.trim() || null,
      occasions,
      custom_occasions: customOccasion.trim() || null,
      languages,
      extra_languages: extraLanguages.trim() || null,
      equipment,
      custom_equipment: customEquipment.trim() || null,
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
    customEquipment,
    customGenre,
    customOccasion,
    equipment,
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

  const toggleEquipment = useCallback((item: string) => {
    setEquipment((prev) => toggleInList(prev, item));
  }, []);

  const rateNum = hourlyRate === "" ? 0 : Number(hourlyRate);
  const platformFee = Math.round(rateNum * 0.15);
  const netRate = Math.round(rateNum * 0.85);

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

      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="mb-3 font-semibold text-amber-900">Maak je profiel compleet</p>
        <div className="space-y-1.5">
          {[
            { label: "Artiestennaam", done: !!stageName.trim() },
            { label: "Bio", done: !!bio.trim() && bio.trim().length > 50 },
            { label: "Stad", done: !!homeCity.trim() },
            { label: "Uurtarief", done: hourlyRate !== "" && hourlyRate !== 0 },
            { label: "Genres", done: genres.length > 0 },
            { label: "Gelegenheden", done: occasions.length > 0 },
            { label: "Foto's", done: photos.length > 0 },
            { label: "Apparatuur", done: equipment.length > 0 },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              {done ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-green-500" aria-hidden />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
              )}
              <span
                className={
                  done
                    ? "text-gray-500 line-through"
                    : "font-medium text-amber-800"
                }
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

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
              {rateNum > 0 ? (
                <div className="mt-2 rounded-xl bg-gray-50 p-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Jouw uurtarief</span>
                    <span>€{rateNum}/uur</span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>Platformkosten (15%)</span>
                    <span>-€{platformFee}/uur</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-semibold text-green-600">
                    <span>Jij ontvangt</span>
                    <span>€{netRate}/uur</span>
                  </div>
                </div>
              ) : null}
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
              {yearsExperience === "" || yearsExperience === 0 ? (
                <p className="mt-1.5 text-xs text-gray-500">
                  Opkomend talent — laat leeg of 0 als je net begint.
                </p>
              ) : null}
            </label>
          </div>

          <div className="mt-8">
            <p className="mb-1 text-sm font-semibold text-gray-900">Apparatuur</p>
            <p className="mb-3 text-xs text-gray-500">
              Welke apparatuur breng je zelf mee?
            </p>
            <div className="space-y-2">
              {EQUIPMENT_PRESETS.map((item) => (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={equipment.includes(item)}
                    onChange={() => toggleEquipment(item)}
                    className="h-5 w-5 rounded accent-green-500"
                  />
                  <span className="text-sm text-gray-700">{item}</span>
                </label>
              ))}
            </div>
            <div className="mt-3">
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Andere apparatuur?
              </label>
              <input
                type="text"
                value={customEquipment}
                onChange={(e) => setCustomEquipment(e.target.value)}
                placeholder="Bijv. LED wall, rookmachine..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Genres column */}
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-gray-900 mb-1">Genres</p>
              <p className="text-xs text-gray-500 mb-3">
                Selecteer alle genres die op jou van toepassing zijn.
              </p>
              <div className="flex-1 border border-gray-200 rounded-2xl p-3 max-h-52 overflow-y-auto space-y-2">
                {GENRES.map((g) => (
                  <label key={g} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={genres.includes(g)}
                      onChange={() => toggleGenre(g)}
                      className="accent-green-500"
                    />
                    {g}
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Staat jouw genre er niet bij?
                </label>
                <input
                  type="text"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="Bijv. Moombahton, Afrobeats..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>

            {/* Occasions column */}
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-gray-900 mb-1">Gelegenheden</p>
              <p className="text-xs text-gray-500 mb-3">
                Voor welke gelegenheden ben je beschikbaar?
              </p>
              <div className="flex-1 border border-gray-200 rounded-2xl p-3 max-h-52 overflow-y-auto space-y-2">
                {OCCASIONS.map((o) => (
                  <label key={o} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={occasions.includes(o)}
                      onChange={() => toggleOccasion(o)}
                      className="accent-green-500"
                    />
                    {o}
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Staat jouw gelegenheid er niet bij?
                </label>
                <input
                  type="text"
                  value={customOccasion}
                  onChange={(e) => setCustomOccasion(e.target.value)}
                  placeholder="Bijv. Straatfeest, Kerstmarkt..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>

            {/* Languages column */}
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-gray-900 mb-1">Talen</p>
              <p className="text-xs text-gray-500 mb-3">Welke talen spreek je?</p>
              <div className="flex-1 border border-gray-200 rounded-2xl p-3 space-y-2">
                {LANGUAGES.map((l) => (
                  <label key={l} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={languages.includes(l)}
                      onChange={() => toggleLanguage(l)}
                      className="accent-green-500"
                    />
                    {l}
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Andere talen?
                </label>
                <input
                  type="text"
                  value={extraLanguages}
                  onChange={(e) => setExtraLanguages(e.target.value)}
                  placeholder="Bijv. Spaans, Italiaans..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>
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
