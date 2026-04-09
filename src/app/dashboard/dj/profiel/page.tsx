"use client";

import Link from "next/link";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { Tooltip } from "@/components/Tooltip";
import { calculateServiceFee, calculateTotalPrice } from "@/lib/pricing";
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
  const serviceFee = rateNum > 0 ? calculateServiceFee(rateNum) : 0;
  const customerTotal = rateNum > 0 ? calculateTotalPrice(rateNum) : 0;

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
              <span className="mb-1 flex items-center text-sm font-medium text-gray-700">
                Artiestennaam
                <Tooltip text="Je publieke naam op bookadj. Gebruik je DJ naam zoals je die op flyers en social media gebruikt. Maximaal 50 tekens." />
              </span>
              <input
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 w-full focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                placeholder="Bijv. DJ Nova"
              />
            </label>

            <label className="block">
              <span className="mb-1 flex items-center text-sm font-medium text-gray-700">
                Stad
                <Tooltip text="Vul de stad in waar je gevestigd bent. Maximaal 1 stad. Klanten in de buurt vinden jou sneller. Reiskosten worden apart berekend op basis van afstand." />
              </span>
              <input
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 w-full focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                placeholder="Bijv. Amsterdam"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 flex items-center text-sm font-medium text-gray-700">
                Bio
                <Tooltip text="Vertel klanten wie je bent en wat je doet. Beschrijf je stijl, ervaring en wat jou uniek maakt. Minimaal 50 tekens voor een volledig profiel. Geen telefoonnummers of externe links toevoegen." />
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
              <span className="mb-1 flex items-center text-sm font-medium text-gray-700">
                Uurtarief
                <Tooltip text="Dit is het bedrag dat klanten per uur zien. bookadj rekent 15% platformkosten. Jij ontvangt 85% van het overeengekomen bedrag. Minimaal €50/uur, maximaal €500/uur." />
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
                    <span>Boekingsbescherming (klant betaalt)</span>
                    <span>+€{serviceFee}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-semibold text-green-600">
                    <span>Jij ontvangt</span>
                    <span>€{rateNum}/uur</span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>Klant betaalt totaal</span>
                    <span>€{customerTotal}</span>
                  </div>
                </div>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-1 flex items-center text-sm font-medium text-gray-700">
                Jaren ervaring
                <Tooltip text="Hoeveel jaar draai je al professioneel? Vul 0 in als je net begint. Dit wordt getoond als 'Opkomend talent' op je profiel." />
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
            <div className="flex items-center">
              <p className="text-sm font-semibold text-gray-900">Apparatuur</p>
              <Tooltip text="Welke apparatuur breng je zelf mee? Klanten weten zo wat ze wel en niet extra hoeven te regelen. Vul dit zo volledig mogelijk in." />
            </div>
            <p className="mb-3 mt-0.5 text-xs text-gray-500">
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
              <p className="mb-1.5 flex items-center text-xs font-medium text-gray-500">
                Andere apparatuur?
                <Tooltip text="Vul hier extra apparatuur in die niet in de lijst staat, bijvoorbeeld LED wall of rookmachine." />
              </p>
              <input
                type="text"
                value={customEquipment}
                onChange={(e) => setCustomEquipment(e.target.value)}
                placeholder="Bijv. LED wall, rookmachine..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* GENRES */}
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex items-center">
                  <p className="text-sm font-semibold text-gray-900">Genres</p>
                  <Tooltip text="Selecteer alle genres die je speelt. Je kunt meerdere genres kiezen. Klanten zoeken op genre, dus hoe completer hoe beter. Voeg eigen genres toe als ze er niet bij staan." />
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Selecteer alle genres die op jou van toepassing zijn.
                </p>
              </div>
              <div
                className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 p-3"
                style={{ height: "220px" }}
              >
                <div className="space-y-2">
                  {GENRES.map((genre) => (
                    <label
                      key={genre}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={genres.includes(genre)}
                        onChange={() => toggleGenre(genre)}
                        className="h-5 w-5 flex-none rounded accent-green-500"
                      />
                      <span className="text-sm text-gray-700">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 flex items-center text-xs font-medium text-gray-500">
                  Staat jouw genre er niet bij?
                  <Tooltip text="Typ je eigen genre en druk op Enter. Scheid meerdere genres met een komma. Bijv: Moombahton, Cumbia, Baile Funk" />
                </p>
                <input
                  type="text"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="Bijv. Moombahton, Afrobeats..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>

            {/* GELEGENHEDEN */}
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex items-center">
                  <p className="text-sm font-semibold text-gray-900">Gelegenheden</p>
                  <Tooltip text="Voor welke type events ben je beschikbaar? Klanten filteren op gelegenheid. Selecteer alles wat van toepassing is op jou." />
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Voor welke gelegenheden ben je beschikbaar?
                </p>
              </div>
              <div
                className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 p-3"
                style={{ height: "220px" }}
              >
                <div className="space-y-2">
                  {OCCASIONS.map((occasion) => (
                    <label
                      key={occasion}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={occasions.includes(occasion)}
                        onChange={() => toggleOccasion(occasion)}
                        className="h-5 w-5 flex-none rounded accent-green-500"
                      />
                      <span className="text-sm text-gray-700">{occasion}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 flex items-center text-xs font-medium text-gray-500">
                  Staat jouw gelegenheid er niet bij?
                  <Tooltip text="Typ je eigen gelegenheid. Bijv: Straatfeest, Modeshoot, Sportgala. Scheid meerdere opties met een komma." />
                </p>
                <input
                  type="text"
                  value={customOccasion}
                  onChange={(e) => setCustomOccasion(e.target.value)}
                  placeholder="Bijv. Straatfeest, Kerstmarkt..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>

            {/* TALEN */}
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex items-center">
                  <p className="text-sm font-semibold text-gray-900">Talen</p>
                  <Tooltip text="Welke talen spreek je tijdens een optreden? Dit helpt klanten die een specifieke taal zoeken, bijvoorbeeld voor een internationale bruiloft." />
                </div>
                <p className="mt-0.5 text-xs text-gray-500">Welke talen spreek je?</p>
              </div>
              <div
                className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 p-3"
                style={{ height: "220px" }}
              >
                <div className="space-y-2">
                  {LANGUAGES.map((lang) => (
                    <label
                      key={lang}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={languages.includes(lang)}
                        onChange={() => toggleLanguage(lang)}
                        className="h-5 w-5 flex-none rounded accent-green-500"
                      />
                      <span className="text-sm text-gray-700">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 flex items-center text-xs font-medium text-gray-500">
                  Andere talen?
                  <Tooltip text="Spreek je nog andere talen die niet in de lijst staan? Typ ze hier in, gescheiden door komma's." />
                </p>
                <input
                  type="text"
                  value={extraLanguages}
                  onChange={(e) => setExtraLanguages(e.target.value)}
                  placeholder="Bijv. Spaans, Italiaans..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
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
