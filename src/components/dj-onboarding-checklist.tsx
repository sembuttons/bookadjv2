"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useState } from "react";

const LS_PREFIX = "bookadj_dj_onboarding_done_";

function photosDone(raw: unknown): boolean {
  if (!Array.isArray(raw)) return false;
  return raw.some((x) => typeof x === "string" && x.trim().length > 0);
}

function strDone(raw: unknown): boolean {
  return typeof raw === "string" && raw.trim().length > 0;
}

type Props = {
  djProfileId: string;
  photos: unknown;
  videoUrl: unknown;
  instagramUrl: unknown;
  soundcloudUrl: unknown;
};

export function DjOnboardingChecklist({
  djProfileId,
  photos,
  videoUrl,
  instagramUrl,
  soundcloudUrl,
}: Props) {
  const [dismissed, setDismissed] = useState(false);

  const steps = useMemo(() => {
    const s2 = photosDone(photos);
    const s3 = strDone(videoUrl);
    const s4 = strDone(instagramUrl) && strDone(soundcloudUrl);
    const doneCount = 1 + (s2 ? 1 : 0) + (s3 ? 1 : 0) + (s4 ? 1 : 0);
    return {
      s2,
      s3,
      s4,
      doneCount,
      allDone: s2 && s3 && s4,
    };
  }, [photos, videoUrl, instagramUrl, soundcloudUrl]);

  useLayoutEffect(() => {
    try {
      const key = LS_PREFIX + djProfileId;
      if (localStorage.getItem(key) === "1") {
        setDismissed(true);
        return;
      }
      if (steps.allDone) {
        localStorage.setItem(key, "1");
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }
  }, [djProfileId, steps.allDone]);

  if (dismissed || steps.allDone) return null;

  const pct = (steps.doneCount / 4) * 100;

  return (
    <section
      className="rounded-2xl border border-green-800/40 bg-gradient-to-br from-[#052e16] to-[#0a0a0a] p-6 shadow-sm ring-1 ring-green-800/35"
      aria-labelledby="onboarding-heading"
    >
      <h2 id="onboarding-heading" className="text-lg font-bold text-white">
        Maak je profiel compleet
      </h2>
      <p className="mt-1 text-sm text-gray-400">
        Een volledig profiel trekt meer serieuze boekingen. Je staat op{" "}
        <span className="font-semibold text-white">{steps.doneCount}/4</span>.
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#052e16]/70">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="mt-5 space-y-2 text-sm text-white">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-green-400" aria-hidden>
            ✓
          </span>
          <span>
            <strong>Profiel aangemaakt</strong>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 w-4 text-center text-gray-500" aria-hidden>
            {steps.s2 ? "✓" : "☐"}
          </span>
          <span>
            Foto&apos;s toegevoegd —{" "}
            <Link href="/dashboard/dj/media" className="font-semibold text-green-500 underline">
              Media &amp; links
            </Link>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 w-4 text-center text-gray-500" aria-hidden>
            {steps.s3 ? "✓" : "☐"}
          </span>
          <span>
            Video gelinkt —{" "}
            <Link href="/dashboard/dj/media" className="font-semibold text-green-500 underline">
              Media &amp; links
            </Link>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 w-4 text-center text-gray-500" aria-hidden>
            {steps.s4 ? "✓" : "☐"}
          </span>
          <span>
            Instagram &amp; Soundcloud gekoppeld —{" "}
            <Link href="/dashboard/dj/media" className="font-semibold text-green-500 underline">
              Media &amp; links
            </Link>
          </span>
        </li>
      </ul>
    </section>
  );
}
