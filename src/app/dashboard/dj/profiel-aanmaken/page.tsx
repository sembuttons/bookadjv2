"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardShellSkeleton } from "@/components/skeleton";
import { supabase } from "@/lib/supabase-browser";
import { OCCASION_OPTIONS } from "@/lib/occasions";

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

/** Consistent label → control spacing across the form */
const labelCls = "text-sm font-semibold text-neutral-800";
const fieldStack = "flex flex-col gap-2";
const inputCls =
  "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10";
const hintCls = "text-xs text-neutral-500";
const errCls = "text-sm text-red-600";

function netAfterPlatformFee(hourly: number): string {
  const net = hourly * 0.85;
  return net.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseExtraLanguages(raw: string): string[] {
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function mergeLanguageLists(preset: string[], extra: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of [...preset, ...extra]) {
    const k = x.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
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
  const [languagesExtra, setLanguagesExtra] = useState("");
  const [genres, setGenres] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GENRE_OPTIONS.map((g) => [g, false])),
  );
  const [occasions, setOccasions] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(OCCASION_OPTIONS.map((o) => [o.id, false])),
  );
  const [hourlyRate, setHourlyRate] = useState("");
  const [ratePerKm, setRatePerKm] = useState("0.42");
  const [vatNumber, setVatNumber] = useState("");
  const [kvkNumber, setKvkNumber] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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

  const selectedOccasions = useMemo(
    () => OCCASION_OPTIONS.filter((o) => occasions[o.id]).map((o) => o.id),
    [occasions],
  );

  const selectedPresetLanguages = useMemo(
    () => LANGUAGE_OPTIONS.filter((l) => languages[l]),
    [languages],
  );

  const languagesForSave = useMemo(
    () =>
      mergeLanguageLists(
        selectedPresetLanguages,
        parseExtraLanguages(languagesExtra),
      ),
    [languagesExtra, selectedPresetLanguages],
  );

  const hourlyNum = useMemo(() => {
    const n = parseFloat(hourlyRate.replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  }, [hourlyRate]);

  const previewHourly = useMemo(() => {
    if (Number.isFinite(hourlyNum) && hourlyNum > 0) return hourlyNum;
    return null;
  }, [hourlyNum]);

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
    setFieldErrors((p) => {
      const n = { ...p };
      delete n.genres;
      return n;
    });
  };

  const toggleOccasion = (id: string) => {
    setOccasions((prev) => ({ ...prev, [id]: !prev[id] }));
    setFieldErrors((p) => {
      const n = { ...p };
      delete n.occasions;
      return n;
    });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace(
          `/auth?redirect=${encodeURIComponent("/dashboard/dj/profiel-aanmaken")}`,
        );
        return;
      }

      const name = stageName.trim();
      const bioTrim = bio.trim();
      const cityTrim = city.trim();
      const vatTrim = vatNumber.trim().toUpperCase();
      const kvkTrim = kvkNumber.trim();

      const err: Record<string, string> = {};
      if (!name) err.stageName = "Dit veld is verplicht";
      if (!bioTrim) err.bio = "Dit veld is verplicht";
      else if (bioTrim.length > BIO_MAX)
        err.bio = `Maximaal ${BIO_MAX} tekens.`;
      if (!cityTrim) err.city = "Dit veld is verplicht";
      if (selectedGenres.length < 1) err.genres = "Dit veld is verplicht";
      if (selectedOccasions.length < 1)
        err.occasions = "Kies minimaal één gelegenheid.";
      if (!Number.isFinite(hourlyNum) || hourlyNum <= 0)
        err.hourlyRate = "Dit veld is verplicht";
      const rpk = parseFloat(ratePerKm.replace(",", "."));
      if (!Number.isFinite(rpk) || rpk < 0)
        err.ratePerKm = "Dit veld is verplicht";
      if (!VAT_PATTERN.test(vatTrim))
        err.vatNumber = "Gebruik formaat NL123456789B01.";
      if (!KVK_PATTERN.test(kvkTrim))
        err.kvkNumber = "Dit veld is verplicht (8 cijfers).";

      setFieldErrors(err);
      if (Object.keys(err).length > 0) return;

      const userId = session.user.id;

      const yearsParsed = yearsExperience.trim()
        ? parseInt(yearsExperience.trim(), 10)
        : null;
      const yearsExp =
        yearsParsed != null && !Number.isNaN(yearsParsed) && yearsParsed >= 0
          ? yearsParsed
          : null;

      setSubmitting(true);

      const { error: userUpsertError } = await supabase.from("users").upsert(
        {
          id: userId,
          email: session.user.email ?? null,
          role: "dj",
        },
        { onConflict: "id" },
      );
      if (userUpsertError) {
        setSubmitting(false);
        setSubmitError(userUpsertError.message);
        return;
      }

      const payload = {
        user_id: userId,
        stage_name: name,
        bio: bioTrim,
        city: cityTrim,
        genres: selectedGenres,
        occasions: selectedOccasions,
        hourly_rate: hourlyNum,
        rate_per_km: rpk,
        vat_number: vatTrim,
        kvk_number: kvkTrim,
        verification_status: "pending" as const,
        is_visible: false,
        ...(yearsExp != null ? { years_experience: yearsExp } : {}),
        ...(languagesForSave.length > 0
          ? { languages: languagesForSave }
          : {}),
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
      hourlyNum,
      hourlyRate,
      kvkNumber,
      languagesForSave,
      ratePerKm,
      selectedGenres,
      selectedOccasions,
      stageName,
      vatNumber,
      yearsExperience,
    ],
  );

  if (!gateReady) {
    return <DashboardShellSkeleton />;
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
        <div className="bg-emerald-50 px-6 py-10 text-center sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Ingediend
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-950">
            Je profiel is ingediend ter verificatie
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-emerald-900/80">
            Dit duurt meestal <strong>1–2 werkdagen</strong>. Je ontvangt een
            e-mail zodra je geverifieerd bent.
          </p>
        </div>
        <div className="px-6 py-8 sm:px-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Wat kun je nu doen?
          </h2>
          <ol className="mt-4 space-y-3 text-sm text-neutral-700">
            <li className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                1
              </span>
              Wacht op verificatie (we houden je op de hoogte per e-mail).
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                2
              </span>
              Houd je inbox in de gaten voor vragen van ons team.
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                3
              </span>
              Na goedkeuring word je zichtbaar in de zoekresultaten.
            </li>
          </ol>
          <p className="mt-6 text-xs text-neutral-500">
            Je wordt zo doorgestuurd naar je dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pb-16">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
        DJ-profiel aanmaken
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">
        Vul je gegevens in. Je profiel wordt pas zichtbaar na goedkeuring door
        ons team.
      </p>

      <form
        noValidate
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
          <div className="mt-6 flex flex-col gap-6">
            <div className={fieldStack}>
              <span className={labelCls}>
                Artiestennaam <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                value={stageName}
                onChange={(e) => {
                  setStageName(e.target.value);
                  setFieldErrors((p) => {
                    const n = { ...p };
                    delete n.stageName;
                    return n;
                  });
                }}
                className={inputCls}
                placeholder="Zoals je op het podium heet"
              />
              {fieldErrors.stageName ? (
                <p className={errCls} role="alert">
                  {fieldErrors.stageName}
                </p>
              ) : null}
            </div>

            <div className={fieldStack}>
              <span className={labelCls}>
                Bio <span className="text-red-600">*</span>
              </span>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value.slice(0, BIO_MAX));
                  setFieldErrors((p) => {
                    const n = { ...p };
                    delete n.bio;
                    return n;
                  });
                }}
                rows={5}
                maxLength={BIO_MAX}
                className={`${inputCls} resize-y`}
                placeholder="Wie ben je, wat speel je, wat kan men verwachten?"
              />
              <p className={`${hintCls} text-right`}>
                {bio.length} / {BIO_MAX}
              </p>
              {fieldErrors.bio ? (
                <p className={errCls} role="alert">
                  {fieldErrors.bio}
                </p>
              ) : null}
            </div>

            <div className={fieldStack}>
              <span className={labelCls}>
                Stad <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setFieldErrors((p) => {
                    const n = { ...p };
                    delete n.city;
                    return n;
                  });
                }}
                className={inputCls}
                placeholder="Bijv. Amsterdam"
              />
              <p className={hintCls}>
                Wordt getoond op je profiel en gebruikt als uitvalsbasis voor
                reiskosten.
              </p>
              {fieldErrors.city ? (
                <p className={errCls} role="alert">
                  {fieldErrors.city}
                </p>
              ) : null}
            </div>

            <div className={fieldStack}>
              <span className={labelCls}>Jaren ervaring</span>
              <input
                type="number"
                min={0}
                max={80}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className={`${inputCls} max-w-xs`}
                placeholder="Optioneel"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className={labelCls}>Talen</span>
              <div className="flex flex-wrap gap-3">
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
              <div className={fieldStack}>
                <span className={labelCls}>Andere talen</span>
                <input
                  type="text"
                  value={languagesExtra}
                  onChange={(e) => setLanguagesExtra(e.target.value)}
                  className={inputCls}
                  placeholder="Bijv. Italiaans, Portugees, Japans"
                />
                <p className={hintCls}>
                  Meerdere talen scheiden met een komma. Wordt opgeslagen als
                  lijst samen met je vinkjes hierboven.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-neutral-900">Genres</h2>
            <p className="text-sm text-neutral-600">
              Kies minimaal één genre <span className="text-red-600">*</span>
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
          {fieldErrors.genres ? (
            <p className={`${errCls} mt-2`} role="alert">
              {fieldErrors.genres}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-neutral-900">Gelegenheden</h2>
            <p className="text-sm text-neutral-600">
              Waarvoor wil je geboekt worden?{" "}
              <span className="text-red-600">*</span>
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {OCCASION_OPTIONS.map((o) => (
              <label
                key={o.id}
                className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-100"
              >
                <input
                  type="checkbox"
                  checked={occasions[o.id] ?? false}
                  onChange={() => toggleOccasion(o.id)}
                  className="rounded border-neutral-300 text-black focus:ring-black/20"
                />
                {o.label}
              </label>
            ))}
          </div>
          {fieldErrors.occasions ? (
            <p className={`${errCls} mt-2`} role="alert">
              {fieldErrors.occasions}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-neutral-900">Tarieven</h2>
          <div className="mt-6 flex flex-col gap-6">
            <div className={fieldStack}>
              <span className={labelCls}>
                Uurtarief (€ per uur) <span className="text-red-600">*</span>
              </span>
              <input
                type="number"
                min={1}
                step={1}
                value={hourlyRate}
                onChange={(e) => {
                  setHourlyRate(e.target.value);
                  setFieldErrors((p) => {
                    const n = { ...p };
                    delete n.hourlyRate;
                    return n;
                  });
                }}
                className={`${inputCls} max-w-xs`}
                placeholder="130"
              />
              {fieldErrors.hourlyRate ? (
                <p className={errCls} role="alert">
                  {fieldErrors.hourlyRate}
                </p>
              ) : null}
            </div>

            <div className={fieldStack}>
              <span className={labelCls}>Reiskosten (€ per km)</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={ratePerKm}
                onChange={(e) => {
                  setRatePerKm(e.target.value);
                  setFieldErrors((p) => {
                    const n = { ...p };
                    delete n.ratePerKm;
                    return n;
                  });
                }}
                className={`${inputCls} max-w-xs`}
              />
              <p className={hintCls}>Standaard 0,42 — pas aan indien nodig.</p>
              {fieldErrors.ratePerKm ? (
                <p className={errCls} role="alert">
                  {fieldErrors.ratePerKm}
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
              {previewHourly != null ? (
                <p>
                  Je ontvangt <strong>85%</strong> van elke boeking. Bij een
                  tarief van{" "}
                  <strong>
                    €
                    {previewHourly.toLocaleString("nl-NL", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                    /uur
                  </strong>{" "}
                  ontvang je{" "}
                  <strong>€{netAfterPlatformFee(previewHourly)}</strong> per
                  uur na platformkosten.
                </p>
              ) : (
                <p className="text-emerald-900/90">
                  Vul hierboven je uurtarief in om te zien wat je per uur netto
                  ontvangt na platformkosten (85%).
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-neutral-900">
              Zakelijke gegevens
            </h2>
            <p className="text-sm text-neutral-600">
              Vereist voor uitbetalingen en facturatie.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-6">
            <div className={fieldStack}>
              <span className={labelCls}>
                BTW-nummer <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                value={vatNumber}
                onChange={(e) => {
                  setVatNumber(e.target.value.toUpperCase());
                  setFieldErrors((p) => {
                    const n = { ...p };
                    delete n.vatNumber;
                    return n;
                  });
                }}
                className={`${inputCls} max-w-md font-mono`}
                placeholder="NL123456789B01"
              />
              {fieldErrors.vatNumber ? (
                <p className={errCls} role="alert">
                  {fieldErrors.vatNumber}
                </p>
              ) : null}
            </div>

            <div className={fieldStack}>
              <span className={labelCls}>
                KVK-nummer <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                value={kvkNumber}
                onChange={(e) => {
                  setKvkNumber(e.target.value.replace(/\D/g, "").slice(0, 8));
                  setFieldErrors((p) => {
                    const n = { ...p };
                    delete n.kvkNumber;
                    return n;
                  });
                }}
                className={`${inputCls} max-w-xs font-mono`}
                placeholder="12345678"
              />
              {fieldErrors.kvkNumber ? (
                <p className={errCls} role="alert">
                  {fieldErrors.kvkNumber}
                </p>
              ) : null}
            </div>
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
