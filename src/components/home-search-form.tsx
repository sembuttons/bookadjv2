"use client";

import { useState } from "react";
import { DatePickerPopover } from "@/components/date-picker-popover";
import { OCCASION_OPTIONS } from "@/lib/occasions";

const datumTriggerClass =
  "input-field flex items-center justify-start border-gray-200 bg-white text-left text-slate-900";

export function HomeSearchForm() {
  const [datum, setDatum] = useState("");

  return (
    <form
      className="mx-auto mt-8 max-w-4xl rounded-2xl bg-white p-2 shadow-2xl shadow-green-900/20 sm:mt-10 sm:p-2"
      action="/zoeken"
      method="get"
      role="search"
      aria-label="DJ zoeken"
    >
      <div className="grid grid-cols-1 gap-3 rounded-xl bg-white p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end lg:gap-4">
        <DatePickerPopover
          value={datum}
          onChange={setDatum}
          label="Datum"
          placeholder="Kies een datum"
          hiddenInputName="datum"
          triggerId="home-datum-trigger"
          triggerClassName={datumTriggerClass}
        />

        <label className="flex flex-col gap-2 text-left">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Gelegenheid
          </span>
          <select
            name="occasion"
            className="input-field cursor-pointer bg-white"
            defaultValue=""
          >
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
            className="h-11 min-h-[44px] w-full rounded-xl bg-gradient-to-r from-green-500 to-green-400 px-5 text-sm font-bold text-black transition-all duration-150 hover:from-green-400 hover:to-green-300 active:scale-[0.98]"
          >
            DJ&apos;s zoeken
          </button>
        </div>
      </div>
    </form>
  );
}
