"use client";

import { useState } from "react";
import { DatePickerPopover } from "@/components/date-picker-popover";

const triggerClass =
  "flex h-[42px] w-full items-center rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-left text-sm text-neutral-900 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20";

export function HomeSearchForm({ genres }: { genres: readonly string[] }) {
  const [datum, setDatum] = useState("");

  return (
    <form
      className="mx-auto mt-10 max-w-4xl rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xl sm:p-6"
      action="/zoeken"
      method="get"
      role="search"
      aria-label="DJ zoeken"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end lg:gap-4">
        <DatePickerPopover
          value={datum}
          onChange={setDatum}
          label="Datum"
          placeholder="Kies een datum"
          hiddenInputName="datum"
          triggerId="home-datum-trigger"
          triggerClassName={triggerClass}
        />

        <label className="flex flex-col gap-2 text-left">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Genre
          </span>
          <select
            name="genre"
            className="h-[42px] rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
            defaultValue=""
          >
            <option value="">Alle genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <div className="flex sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            className="h-[42px] w-full rounded-lg bg-black px-5 text-sm font-semibold text-emerald-400 transition-colors hover:bg-neutral-900"
          >
            DJ&apos;s zoeken
          </button>
        </div>
      </div>
    </form>
  );
}
