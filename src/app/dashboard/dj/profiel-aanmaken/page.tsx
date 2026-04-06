"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

const LANGUAGE_OPTIONS = [
  "Nederlands",
  "Engels",
  "Duits",
  "Frans",
  "Spaans",
] as const;

const GENRE_OPTIONS = [
  "House",
  "Techno",
  "Afro House",
  "Hip-hop",
  "R&B",
  "Top 40",
  "Latin",
  "Disco",
  "Drum & Bass",
  "Trance",
  "Hardstyle",
  "Jazz",
  "Lounge",
  "Anders",
] as const;

const BIO_MAX = 500;

const VAT_PATTERN = /^NL\d{9}B\d{2}$/i;
const KVK_PATTERN = /^\d{8}$/;

function netAfterPlatformFee(hourly: number): string {
  const net = hourly * 0.85;
  return net.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function DjProfielAanmakenPage() {
  const router = useRouter();
  const [gateReady, setGateReady] = useState(false);
  const [stageName, setStageName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [languages, setLanguages] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(LANGUAGE_OPTIONS.map((l) => [l, false])),
  );
  const [genres, setGenres] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GENRE_OPTIONS.map((g) => [g, false])),
  );
  const [hourlyRate, setHourlyRate] = useState("");
  const [ratePerKm, setRatePerKm] = useState("0.42");
  const [homeAddress, setHomeAddress] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [kvkNumber, setKvkNumber] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        router.replace(
          `/auth?returnTo=${encodeURIComponent("/dashboard/dj/profiel-aanmaken")}`,
        );
        return;
      }
      const { data: existing } = await supabase
        .from("dj_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (existing?.id) {
        router.replace("/dashboard/dj");
        return;
      }
      setGateReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const selectedGenres = useMemo(
    () => GENRE_OPTIONS.filter((g) => genres[g]),
    [genres],
  );

  const selectedLanguages = useMemo(
    () => LANGUAGE_OPTIONS.filter((l) => languages[l]),
    [languages],
  );

  const hourlyNum = useMemo(() => {
    const n = parseFloat(hourlyRate.replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  }, [hourlyRate]);

  useEffect(() => {
    if (!success) return;
    const t = window.setTimeout(() => {
      router.push("/dashboard/dj");
      router.refresh();
    }, 3000);
    return () => window.clearTimeout(t);
  }, [success, router]);

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) => ({ ...prev, [lang]: !prev[lang] }));
  };

  const toggleGenre = (g: string) => {
    setGenres((prev) => ({ ...prev, [g]: !prev[g] }));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      const name = stageName.trim();
      const bioTrim = bio.trim();
      const cityTrim = city.trim();
      const homeTrim = homeAddress.trim();
      const vatTrim = vatNumber.trim().toUpperCase();
      const kvkTrim = kvkNumber.trim();

      if (!name) {
        setSubmitError("Vul je artiestennaam in.");
        return;
      }
      if (!bioTrim) {
        setSubmitError("Vul je bio in.");
        return;
      }
      if (bioTrim.length > BIO_MAX) {
        setSubmitError(`Bio mag maximaal ${BIO_MAX} tekens zijn.`);
        return;
      }
      if (!cityTrim) {
        setSubmitError("Vul je stad in.");
        return;
      }
      if (selectedGenres.length < 1) {
        setSubmitError("Kies minimaal één genre.");
        return;
      }
      if (!Number.isFinite(hourlyNum) || hourlyNum <= 0) {
        setSubmitError("Vul een geldig uurtarief in.");
        return;
      }
      const rpk = parseFloat(ratePerKm.replace(",", "."));
      if (!Number.isFinite(rpk) || rpk < 0) {
        setSubmitError("Vul een geldig tarief per km in.");
        return;
      }
      if (!homeTrim) {
        setSubmitError("Vul je thuislocatie-adres in.");
        return;
      }
      if (!VAT_PATTERN.test(vatTrim)) {
        setSubmitError("BTW-nummer: gebruik formaat NL123456789B01.");
        return;
      }
      if (!KVK_PATTERN.test(kvkTrim)) {
        setSubmitError("KVK-nummer moet uit 8 cijfers bestaan.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        setSubmitError("Sessie verlopen. Log opnieuw in.");
        return;
      }

      const yearsParsed = yearsExperience.trim()
        ? parseInt(yearsExperience.trim(), 10)
        : null;
      const yearsExp =
        yearsParsed != null && !Number.isNaN(yearsParsed) && yearsParsed >= 0
          ? yearsParsed
          : null;

      setSubmitting(true);

      const payload = {
        user_id: session.user.id,
        stage_name: name,
        bio: bioTrim,
        city: cityTrim,
        genres: selectedGenres,
        hourly_rate: hourlyNum,
        rate_per_km: rpk,
        vat_number: vatTrim,
        kvk_number: kvkTrim,
        verification_status: "pending" as const,
        is_visible: false,
        ...(yearsExp != null ? { years_experience: yearsExp } : {}),
        ...(selectedLanguages.length > 0
          ? { languages: selectedLanguages }
          : {}),
        home_address: homeTrim,
      };

      const { error } = await supabase.from("dj_profiles").insert(payload);

      setSubmitting(false);

      if (error) {
        setSubmitError(error.message);
        return;
      }

      setSuccess(true);
    },
    [
      bio,
      city,
      homeAddress,
      hourlyNum,
      hourlyRate,
      kvkNumber,
      ratePerKm,
      selectedGenres,
      selectedLanguages,
      stageName,
      vatNumber,
      yearsExperience,
    ],
  );

  if (!gateReady) {
    return (
      <div className="min-h-[40vh] bg-white py-12 text-center text-neutral-600">
        Laden…
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-emerald-950">
          Profiel aangemaakt! Ons team beoordeelt je aanvraag binnen 48 uur.
        </p>
        <p className="mt-3 text-sm text-emerald-900/80">
          Je wordt doorgestuurd naar je dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white pb-16">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
        DJ-profiel aanmaken
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-neutral-600">
        Vul je gegevens in. Je profiel wordt pas zichtbaar na goedkeuring door
        ons team.
      </p>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="mt-10 max-w-3xl space-y-10"
      >
        {submitError ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {submitError}
          </p>
        ) : null}

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-neutral-900">Basisinformatie</h2>
          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-neutral-800">
                Artiestennaam <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                required
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                placeholder="Zoals je op het podium heet"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-neutral-800">
                Bio <span className="text-red-600">*</span>
              </span>
              <textarea
                required
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
                rows={5}
                maxLength={BIO_MAX}
                className="mt-2 w-full resize-y rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                placeholder="Wie ben je, wat speel je, wat kan men verwachten?"
              />
              <p className="mt-1 text-right text-xs text-neutral-500">
                {bio.length} / {BIO_MAX}
              </p>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-neutral-800">
                Stad <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                placeholder="Bijv. Amsterdam"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-neutral-800">
                Jaren ervaring
              </span>
              <input
                type="number"
                min={0}
                max={80}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className="mt-2 w-full max-w-xs rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                placeholder="Optioneel"
              />
            </label>
            <fieldset>
              <legend className="text-sm font-semibold text-neutral-800">
                Talen
              </legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <label
                    key={lang}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-100"
                  >
                    <input
                      type="checkbox"
                      checked={languages[lang] ?? false}
                      onChange={() => toggleLanguage(lang)}
                      className="rounded border-neutral-300 text-black focus:ring-black/20"
                    />
                    {lang}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-neutral-900">Genres</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Kies minimaal één genre <span className="text-red-600">*</span>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {GENRE_OPTIONS.map((g) => (
              <label
                key={g}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-100"
              >
                <input
                  type="checkbox"
                  checked={genres[g] ?? false}
                  onChange={() => toggleGenre(g)}
                  className="rounded border-neutral-300 text-black focus:ring-black/20"
                />
                {g}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-neutral-900">Tarieven</h2>
          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-neutral-800">
                Uurtarief (€ per uur) <span className="text-red-600">*</span>
              </span>
              <input
                type="number"
                required
                min={1}
                step={1}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="mt-2 w-full max-w-xs rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                placeholder="130"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-neutral-800">
                Reiskosten (€ per km)
              </span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={ratePerKm}
                onChange={(e) => setRatePerKm(e.target.value)}
                className="mt-2 w-full max-w-xs rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Standaard 0,42 — pas aan indien nodig.
              </p>
            </label>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
              <p>
                Je ontvangt <strong>85%</strong> van elke boeking. Bij een
                tarief van <strong>€130/uur</strong> ontvang je{" "}
                <strong>€{netAfterPlatformFee(130)}</strong> per uur na
                platformkosten.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-neutral-900">Locatie</h2>
          <label className="mt-6 block">
            <span className="text-sm font-semibold text-neutral-800">
              Thuislocatie adres <span className="text-red-600">*</span>
            </span>
            <input
              type="text"
              required
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
              className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
              placeholder="Straat, huisnummer, postcode, plaats"
            />
            <p className="mt-2 text-xs text-neutral-500">
              Wordt gebruikt voor reiskostenberekening. Niet zichtbaar voor
              klanten.
            </p>
          </label>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-neutral-900">
            Zakelijke gegevens
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Vereist voor uitbetalingen en facturatie.
          </p>
          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-neutral-800">
                BTW-nummer <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                required
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value.toUpperCase())}
                className="mt-2 w-full max-w-md rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                placeholder="NL123456789B01"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-neutral-800">
                KVK-nummer <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                required
                inputMode="numeric"
                pattern="\d{8}"
                maxLength={8}
                value={kvkNumber}
                onChange={(e) =>
                  setKvkNumber(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                className="mt-2 w-full max-w-xs rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                placeholder="12345678"
              />
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-black py-3.5 text-sm font-bold text-white hover:bg-neutral-900 disabled:opacity-50 sm:w-auto sm:px-10"
        >
          {submitting ? "Bezig…" : "Profiel aanmaken"}
        </button>
      </form>
    </div>
  );
}
