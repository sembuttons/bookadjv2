"use client";

import { Check, Trash2, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tooltip } from "@/components/Tooltip";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [soundcloudUrl, setSoundcloudUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

  const maxPhotos = 6;

  const extractStoragePathFromPublicUrl = (url: string): string | null => {
    const marker = "/storage/v1/object/public/dj-photos/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const path = url.slice(idx + marker.length);
    return path ? decodeURIComponent(path) : null;
  };

  const uploadPhoto = useCallback(
    async (file: File) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error("Geen sessie.");

      const fileNameSafe = file.name.replace(/[^\w.\-()]+/g, "-");
      const fileName = `${userId}/${Date.now()}-${fileNameSafe}`;

      const { error: upErr } = await supabase.storage
        .from("dj-photos")
        .upload(fileName, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from("dj-photos").getPublicUrl(fileName);
      return data.publicUrl;
    },
    [],
  );

  const validateFiles = (files: File[]): string | null => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    for (const f of files) {
      if (!allowed.includes(f.type)) {
        return "Alleen JPG, PNG of WEBP toegestaan.";
      }
      if (f.size > 5 * 1024 * 1024) {
        return "Maximaal 5MB per foto.";
      }
    }
    return null;
  };

  const handleFiles = useCallback(
    async (files: File[]) => {
      setError(null);
      setSuccess(null);

      if (uploading || saving) return;
      if (photos.length >= maxPhotos) {
        setError("Je kunt maximaal 6 foto's uploaden.");
        return;
      }

      const remaining = Math.max(0, maxPhotos - photos.length);
      const take = files.slice(0, remaining);
      if (!take.length) return;

      const validationError = validateFiles(take);
      if (validationError) {
        setError(validationError);
        return;
      }

      setUploading(true);
      setUploadProgress(5);
      const tick = window.setInterval(() => {
        setUploadProgress((p) => (p < 85 ? p + 5 : p));
      }, 180);

      try {
        const uploaded = [];
        for (const f of take) {
          // eslint-disable-next-line no-await-in-loop
          const url = await uploadPhoto(f);
          uploaded.push(url);
        }
        const next = normalizePhotoList([...photos, ...uploaded]);
        setPhotos(next);
        await persist({ photos: next });
        setUploadProgress(100);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload mislukt.");
      } finally {
        window.clearInterval(tick);
        window.setTimeout(() => setUploadProgress(0), 400);
        setUploading(false);
      }
    },
    [photos, persist, saving, uploadPhoto, uploading],
  );

  const removePhoto = useCallback(
    async (idx: number) => {
      if (saving || uploading) return;
      const url = photos[idx];
      const next = photos.filter((_, i) => i !== idx);
      setPhotos(next);

      try {
        const path = url ? extractStoragePathFromPublicUrl(url) : null;
        if (path) {
          await supabase.storage.from("dj-photos").remove([path]);
        }
      } catch {
        /* best effort */
      }

      await persist({ photos: next });
    },
    [persist, photos, saving, uploading],
  );

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
  const canAddMore = photos.length < maxPhotos;
  const uploadHint = useMemo(() => {
    const remaining = maxPhotos - photos.length;
    return remaining > 0 ? `Je kunt nog ${remaining} foto${remaining === 1 ? "" : "'s"} uploaden.` : "Maximum bereikt.";
  }, [photos.length]);

  if (loading) {
    return (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Media &amp; links
        </h1>
        <p className="mt-2 text-sm text-gray-400">Laden…</p>
      </>
    );
  }

  if (!djProfileId) {
    return (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
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

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Foto&apos;s</h2>
        <p className="mt-1 text-sm text-gray-400">
          Upload maximaal 6 foto&apos;s (JPG/PNG/WEBP, max. 5MB per foto).
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []);
            e.target.value = "";
            void handleFiles(list);
          }}
        />

        <div
          className={`mt-4 rounded-2xl border-2 border-dashed p-6 transition-colors ${
            dragActive
              ? "border-green-300 bg-green-50"
              : "border-gray-200 bg-gray-50"
          }`}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            const files = Array.from(e.dataTransfer.files ?? []);
            void handleFiles(files);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          aria-disabled={!canAddMore || uploading || saving}
        >
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-500 ring-1 ring-gray-200">
              <UploadCloud className="h-6 w-6" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-gray-900">
              Klik om foto&apos;s te uploaden of sleep ze hierheen
            </p>
            <p className="text-xs text-gray-500">{uploadHint}</p>
          </div>

          {uploading ? (
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-500 transition-[width] duration-200"
                  style={{ width: `${uploadProgress}%` }}
                  aria-hidden
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Uploaden…</p>
            </div>
          ) : null}
        </div>

        {photos.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((url, i) => (
              <li
                key={`${url}-${i}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <button
                  type="button"
                  disabled={saving || uploading}
                  onClick={() => void removePhoto(i)}
                  className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white/95 text-slate-700 opacity-0 shadow-sm transition-opacity hover:bg-gray-50 group-hover:opacity-100 disabled:opacity-40"
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

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Video</h2>
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
          <div className="mt-6 aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-black">
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

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Instagram &amp; SoundCloud</h2>
        <p className="mt-1 text-sm text-gray-400">
          Wordt op je profiel getoond zodra beide kloppen (optioneel per link).
        </p>
        <label className="mt-4 block">
          <span className="flex items-center text-sm font-medium text-gray-700">
            Instagram URL
            <Tooltip text="Link naar je Instagram profiel. Gebruik de volledige URL: https://instagram.com/jouwhandle. Wordt als embed getoond op je profiel." />
          </span>
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
          <span className="flex items-center text-sm font-medium text-gray-700">
            Soundcloud URL
            <Tooltip text="Link naar je Soundcloud profiel of een specifieke mix. Gebruik de volledige URL: https://soundcloud.com/jouwhandle. Wordt als player getoond op je profiel." />
          </span>
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
