import { formatPrice } from "@/lib/pricing";

export type TravelBreakdownLine =
  | { state: "pending"; label: string }
  | { state: "loading" }
  | { state: "indicative"; euro: number; returnKm?: number };

type Props = {
  variant: "light" | "dark";
  hours: number;
  hourlyRate: number;
  djTariffEuro: number;
  serviceEuro: number;
  travel: TravelBreakdownLine;
  grandTotalEuro: number;
};

function RowDivider({ dark }: { dark: boolean }) {
  return (
    <div
      className={dark ? "border-t border-gray-600" : "border-t border-gray-200"}
      role="presentation"
    />
  );
}

export function BookingCostBreakdownCard({
  variant,
  hours,
  hourlyRate,
  djTariffEuro,
  serviceEuro,
  travel,
  grandTotalEuro,
}: Props) {
  const dark = variant === "dark";
  const box = dark
    ? "rounded-xl border border-gray-700 bg-gray-800/60 px-4 py-3 text-sm"
    : "rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const row = dark ? "text-gray-300" : "text-gray-600";
  const value = dark ? "font-medium text-white" : "font-semibold text-gray-900";

  const travelContent =
    travel.state === "pending" ? (
      <span className={`italic ${muted}`}>{travel.label}</span>
    ) : travel.state === "loading" ? (
      <span className={muted}>…</span>
    ) : (
      <span className={`italic ${row}`}>
        {travel.euro <= 0
          ? `€0 (${travel.returnKm != null ? `ca. ${travel.returnKm} km retour` : "retour"})`
          : `${formatPrice(travel.euro)}${travel.returnKm != null ? ` · ca. ${travel.returnKm} km retour` : ""}`}
      </span>
    );

  return (
    <div className={box}>
      <div className="flex justify-between gap-3 py-2 first:pt-0">
        <div className="min-w-0">
          <span className={row}>DJ-tarief</span>
          <p className={`mt-0.5 text-xs ${muted}`}>
            {hours} × {formatPrice(hourlyRate)}/uur
          </p>
        </div>
        <span className={`shrink-0 tabular-nums ${value}`}>
          {formatPrice(djTariffEuro)}
        </span>
      </div>
      <RowDivider dark={dark} />
      <div className="flex justify-between gap-3 py-2">
        <div className="min-w-0">
          <span className={row}>Servicekosten bookadj</span>
          <p className={`mt-0.5 text-xs ${muted}`}>
            10% van het DJ-tarief (min. €15, max. €150)
          </p>
        </div>
        <span className={`shrink-0 tabular-nums ${value}`}>
          {formatPrice(serviceEuro)}
        </span>
      </div>
      <RowDivider dark={dark} />
      <div className="flex justify-between gap-3 py-2">
        <span className={row}>Reiskosten</span>
        <span className="max-w-[60%] text-right text-sm">{travelContent}</span>
      </div>
      <RowDivider dark={dark} />
      <div className="flex justify-between gap-3 pt-2">
        <span className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>
          Totaal
        </span>
        <span
          className={`shrink-0 text-lg font-bold tabular-nums ${dark ? "text-white" : "text-gray-900"}`}
        >
          {formatPrice(grandTotalEuro)}
        </span>
      </div>
      <p className={`mt-3 text-xs leading-relaxed ${muted}`}>
        Reiskosten zijn indicatief en worden door de DJ bevestigd na boeking.
      </p>
    </div>
  );
}
