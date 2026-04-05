"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

type TabKey = "instagram" | "soundcloud";

type Props = {
  djFirstName: string;
  instagramUrl?: string | null;
  soundcloudUrl?: string | null;
};

export function MediaTabs({
  djFirstName,
  instagramUrl,
  soundcloudUrl,
}: Props) {
  const ig = typeof instagramUrl === "string" ? instagramUrl.trim() : "";
  const sc = typeof soundcloudUrl === "string" ? soundcloudUrl.trim() : "";

  const tabs = useMemo(() => {
    const t: { key: TabKey; label: string; url: string }[] = [];
    if (ig) t.push({ key: "instagram", label: "Instagram", url: ig });
    if (sc) t.push({ key: "soundcloud", label: "SoundCloud", url: sc });
    return t;
  }, [ig, sc]);

  const [active, setActive] = useState<TabKey | null>(
    () => tabs[0]?.key ?? null,
  );

  if (tabs.length === 0) {
    return null;
  }

  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  const scEmbed =
    current.key === "soundcloud"
      ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(current.url)}&color=%23000000&inverse=false&auto_play=false&show_user=true`
      : null;

  return (
    <section aria-labelledby="media-heading">
      <h2
        id="media-heading"
        className="text-xl font-bold text-neutral-900 sm:text-2xl"
      >
        {djFirstName} in actie
      </h2>
      {tabs.length > 1 ? (
        <div
          className="mt-4 flex gap-2 border-b border-neutral-200"
          role="tablist"
          aria-label="Social media"
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={current.key === t.key}
              onClick={() => setActive(t.key)}
              className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
                current.key === t.key
                  ? "border-black text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4">
        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline"
        >
          {current.label} openen
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
        </a>
      </div>

      {current.key === "instagram" ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <li
              key={i}
              className="aspect-[9/16] rounded-xl bg-gradient-to-b from-neutral-200 to-neutral-300 ring-1 ring-neutral-200"
            />
          ))}
        </ul>
      ) : null}

      {current.key === "soundcloud" && scEmbed ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
          <iframe
            title="SoundCloud"
            width="100%"
            height="320"
            className="border-0"
            src={scEmbed}
          />
        </div>
      ) : null}
    </section>
  );
}
