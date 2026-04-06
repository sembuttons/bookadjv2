"use client";

import { useState } from "react";
import { DatePickerPopover } from "@/components/date-picker-popover";
import { OCCASION_OPTIONS } from "@/lib/occasions";

const triggerClass =
  "input-field flex items-center justify-start border-0 bg-transparent text-left shadow-none focus:ring-0";

export function HomeSearchForm() {
  const [datum, setDatum] = useState("");

  return (
    <form
      className="mx-auto mt-8 max-w-4xl rounded-2xl border border-gray-800 bg-[#111827] p-4 shadow-xl sm:mt-10 sm:p-6"
      action="/zoeken"
      method="get"
      role="search"
      aria-label="DJ zoeken"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end lg:gap-4">
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
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Gelegenheid
          </span>
          <select name="occasion" className="input-field bg-transparent" defaultValue="">
            <option value="">Alle gelegenheden</option>
            {OCCASION_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            className="h-11 min-h-[44px] w-full rounded-lg bg-green-500 px-5 text-sm font-bold text-black transition-all duration-200 hover:bg-green-400"
          >
            DJ&apos;s zoeken
          </button>
        </div>
      </div>
    </form>
  );
}
