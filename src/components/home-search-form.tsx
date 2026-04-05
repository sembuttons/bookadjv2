"use client";

import { useState } from "react";
import { DatePickerPopover } from "@/components/date-picker-popover";

export function HomeSearchForm({ genres }: { genres: readonly string[] }) {
  const [datum, setDatum] = useState("");

  return (
    <form
      className="mx-auto mt-10 max-w-4xl rounded-2xl bg-white p-4 shadow-xl sm:p-6"
      action="/zoeken"
      method="get"
      role="search"
      aria-label="DJ zoeken"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <label className="flex flex-col gap-1.5 text-left">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Stad
          </span>
          <input
            type="text"
            name="stad"
            placeholder="Bijv. Amsterdam"
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none ring-black transition-[box-shadow] placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2"
          />
        </label>

        <DatePickerPopover
          value={datum}
          onChange={setDatum}
          label="Datum"
          placeholder="Kies een datum"
          hiddenInputName="datum"
          triggerId="home-datum-trigger"
        />

        <label className="flex flex-col gap-1.5 text-left sm:col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Genre
          </span>
          <select
            name="genre"
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none ring-black transition-[box-shadow] focus:border-neutral-400 focus:ring-2"
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

        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            className="h-[42px] w-full rounded-lg bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            DJ&apos;s zoeken
          </button>
        </div>
      </div>
    </form>
  );
}
