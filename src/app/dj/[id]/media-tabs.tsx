"use client";

import { useState } from "react";

const tabs = ["Instagram", "Mixcloud", "SoundCloud"] as const;

type Props = { djFirstName: string };

export function MediaTabs({ djFirstName }: Props) {
  const [active, setActive] = useState<(typeof tabs)[number]>("Instagram");

  return (
    <section aria-labelledby="media-heading">
      <h2
        id="media-heading"
        className="text-xl font-bold text-neutral-900 sm:text-2xl"
      >
        {djFirstName} in actie
      </h2>
      <div
        className="mt-4 flex gap-2 border-b border-neutral-200"
        role="tablist"
        aria-label="Social media"
      >
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={active === t}
            onClick={() => setActive(t)}
            className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              active === t
                ? "border-black text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-neutral-600">
        Placeholder — koppel straks je {active}-feed.
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <li
            key={i}
            className="aspect-[9/16] rounded-xl bg-gradient-to-b from-neutral-200 to-neutral-300 ring-1 ring-neutral-200"
          />
        ))}
      </ul>
    </section>
  );
}
