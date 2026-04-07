"use client";

import { useEffect, useMemo } from "react";

function IconExternalLink({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M14 3h7v7M10 14L21 3M21 14v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

  const instagramHandle = useMemo(() => {
    if (!ig) return "";
    try {
      const u = new URL(ig);
      const parts = u.pathname.split("/").filter(Boolean);
      const first = parts[0] ?? "";
      return first ? `@${first}` : "";
    } catch {
      return "";
    }
  }, [ig]);

  const instagramPermalink = useMemo(() => {
    if (!ig) return "";
    // Instagram embed works for post/reel permalinks, not just profile pages.
    if (/(\/p\/|\/reel\/|\/tv\/)/.test(ig)) return ig;
    return "";
  }, [ig]);

  useEffect(() => {
    if (!instagramPermalink) return;
    const w = window as any;
    const process = () => {
      try {
        w.instgrm?.Embeds?.process?.();
      } catch {
        /* ignore */
      }
    };
    if (w.instgrm?.Embeds) {
      process();
      return;
    }
    const existing = document.querySelector(
      'script[src="//www.instagram.com/embed.js"]',
    );
    if (existing) {
      existing.addEventListener("load", process, { once: true });
      return;
    }
    const s = document.createElement("script");
    s.async = true;
    s.src = "//www.instagram.com/embed.js";
    s.onload = process;
    document.body.appendChild(s);
  }, [instagramPermalink]);

  if (!ig && !sc) {
    return null;
  }

  const scEmbed = sc
    ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(
        sc,
      )}&color=%2322c55e&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false`
    : null;

  return (
    <section aria-labelledby="media-heading" className="space-y-10">
      <h2 id="media-heading" className="text-xl font-bold text-slate-900 sm:text-2xl">
        {djFirstName} in actie
      </h2>

      {ig ? (
        <section aria-label="Instagram">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-bold text-slate-900">
                Volg {djFirstName} op Instagram
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {instagramHandle || "Instagram"} · updates, clips en sfeer
              </p>
            </div>
            <a
              href={ig}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-gray-50"
            >
              <span
                aria-hidden
                className="inline-flex h-5 w-5 items-center justify-center rounded-md"
                style={{
                  background:
                    "linear-gradient(135deg,#f58529,#dd2a7b,#8134af,#515bd4)",
                }}
              />
              Volgen
              <IconExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
            </a>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-gradient-to-b from-gray-100 to-gray-200 ring-1 ring-gray-200"
                aria-hidden
              />
            ))}
          </div>

          {instagramPermalink ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={instagramPermalink}
                data-instgrm-version="14"
                style={{ margin: 0, minWidth: "100%" }}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              Tip: voeg een link toe naar een specifieke post (bijv. /p/ of /reel/) om een embed te tonen.
            </p>
          )}
        </section>
      ) : null}

      {sc && scEmbed ? (
        <section aria-label="SoundCloud">
          <p className="text-lg font-bold text-slate-900">Luister op SoundCloud</p>
          <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 bg-white">
            <iframe
              title="SoundCloud"
              width="100%"
              height="166"
              scrolling="no"
              frameBorder={0}
              src={scEmbed}
            />
          </div>
        </section>
      ) : null}
    </section>
  );
}
