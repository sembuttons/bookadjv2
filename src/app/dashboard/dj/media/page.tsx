"use client";

import { Check, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { parseVideoEmbed, videoEmbedSrc } from "@/lib/video-embed";

function normalizePhotoList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is string => typeof x === "string" && Boolean(x.trim()))
    .map((s) => s.trim())
    .slice(0, 6);
}

export default function DjMediaPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [djProfileId, setDjProfileId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [soundcloudUrl, setSoundcloudUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setError("Geen sessie.");
      setLoading(false);
      return;
    }

    const { data: profile, error: pe } = await supabase
      .from("dj_profiles")
      .select("id, photos, video_url, instagram_url, soundcloud_url")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (pe) {
      setError(pe.message);
      setLoading(false);
      return;
    }
    if (!profile?.id) {
      setDjProfileId(null);
      setLoading(false);
      return;
    }

    setDjProfileId(profile.id as string);
    setPhotos(normalizePhotoList(profile.photos));
    setVideoUrl(typeof profile.video_url === "string" ? profile.video_url : "");
    setInstagramUrl(
      typeof profile.instagram_url === "string" ? profile.instagram_url : "",
    );
    setSoundcloudUrl(
      typeof profile.soundcloud_url === "string" ? profile.soundcloud_url : "",
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const persist = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!djProfileId) return;
      setSaving(true);
      setError(null);
      setSuccess(null);
      const { error: up } = await supabase
        .from("dj_profiles")
        .update(patch)
        .eq("id", djProfileId);
      setSaving(false);
      if (up) {
        setError(up.message);
        return;
      }
      setSuccess("Opgeslagen.");
      window.setTimeout(() => setSuccess(null), 3500);
    },
    [djProfileId],
  );

  const addPhoto = async () => {
    const url = photoInput.trim();
    if (!url) return;
    if (photos.length >= 6) {
      setError("Je kunt maximaal 6 foto-URL's opslaan.");
      return;
    }
    try {
      // eslint-disable-next-line no-new
      new URL(url);
    } catch {
      setError("Voer een geldige URL in (inclusief https://).");
      return;
    }
    const next = [...photos, url];
    setPhotos(next);
    setPhotoInput("");
    await persist({ photos: next });
  };

  const removePhoto = async (idx: number) => {
    const next = photos.filter((_, i) => i !== idx);
    setPhotos(next);
    await persist({ photos: next });
  };

  const saveVideo = async () => {
    const v = videoUrl.trim();
    if (v && !parseVideoEmbed(v)) {
      setError("Voer een geldige YouTube- of Vimeo-URL in.");
      return;
    }
    await persist({ video_url: v || null });
  };

  const saveSocial = async () => {
    const ig = instagramUrl.trim();
    const sc = soundcloudUrl.trim();
    if (ig) {
      try {
        const u = new URL(ig);
        if (!u.hostname.replace(/^www\./, "").includes("instagram.com")) {
          setError("Instagram-URL moet naar instagram.com verwijzen.");
          return;
        }
      } catch {
        setError("Voer een geldige Instagram-URL in.");
        return;
      }
    }
    if (sc) {
      try {
        // eslint-disable-next-line no-new
        new URL(sc);
      } catch {
        setError("Voer een geldige SoundCloud-URL in.");
        return;
      }
    }
    await persist({
      instagram_url: ig || null,
      soundcloud_url: sc || null,
    });
  };

  const embedSrc = videoUrl.trim() ? videoEmbedSrc(videoUrl.trim()) : null;

  if (loading) {
    return (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Media &amp; links
        </h1>
        <p className="mt-2 text-sm text-gray-400">Laden…</p>
      </>
    );
  }

  if (!djProfileId) {
    return (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Media &amp; links
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Je hebt nog geen DJ-profiel. Maak eerst een profiel aan.
        </p>
      </>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Media &amp; links
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Voeg foto-URL&apos;s, een video en je social links toe. Alles wordt op je openbare profiel
          getoond zodra je live bent.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-green-800/40 bg-[#052e16] px-3 py-2 text-sm text-green-400">
          {success}
        </p>
      ) : null}

      <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm">
        <h2 className="text-lg font-bold text-white">Foto&apos;s</h2>
        <p className="mt-1 text-sm text-gray-400">
          Plak URL&apos;s van Unsplash of je eigen hosting (max. 6).
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            value={photoInput}
            onChange={(e) => {
              setPhotoInput(e.target.value);
              setError(null);
            }}
            placeholder="https://…"
            className="input-field flex-1"
          />
          <button
            type="button"
            disabled={saving || photos.length >= 6}
            onClick={() => void addPhoto()}
            className="rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-green-400 disabled:opacity-50"
          >
            Toevoegen
          </button>
        </div>
        {photos.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((url, i) => (
              <li
                key={`${url}-${i}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-800 bg-[#0f172a]/80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void removePhoto(i)}
                  className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a0a0a]/80 text-white opacity-0 ring-1 ring-gray-800 transition-opacity hover:bg-gray-700 group-hover:opacity-100 disabled:opacity-40"
                  aria-label="Foto verwijderen"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-gray-500">Nog geen foto&apos;s toegevoegd.</p>
        )}
      </section>

      <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm">
        <h2 className="text-lg font-bold text-white">Video</h2>
        <p className="mt-1 text-sm text-gray-400">YouTube- of Vimeo-link naar je showcase-set.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(e.target.value);
              setError(null);
            }}
            placeholder="https://www.youtube.com/watch?v=… of Vimeo"
            className="input-field flex-1"
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveVideo()}
            className="rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-green-400 disabled:opacity-50"
          >
            Video opslaan
          </button>
        </div>
        {embedSrc ? (
          <div className="mt-6 aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-gray-800 bg-black">
            <iframe
              title="Video preview"
              src={embedSrc}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm">
        <h2 className="text-lg font-bold text-white">Instagram &amp; SoundCloud</h2>
        <p className="mt-1 text-sm text-gray-400">
          Wordt op je profiel getoond zodra beide kloppen (optioneel per link).
        </p>
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase text-gray-500">Instagram</span>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => {
                setInstagramUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://www.instagram.com/…"
              className="input-field flex-1"
            />
            {instagramUrl.trim() ? (
              <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-green-400">
                <Check className="h-4 w-4" aria-hidden />
                Gekoppeld
              </span>
            ) : null}
          </div>
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase text-gray-500">SoundCloud</span>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              type="url"
              value={soundcloudUrl}
              onChange={(e) => {
                setSoundcloudUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://soundcloud.com/…"
              className="input-field flex-1"
            />
            {soundcloudUrl.trim() ? (
              <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-green-400">
                <Check className="h-4 w-4" aria-hidden />
                Gekoppeld
              </span>
            ) : null}
          </div>
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveSocial()}
          className="mt-6 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-green-400 disabled:opacity-50"
        >
          Social links opslaan
        </button>
      </section>
    </div>
  );
}
