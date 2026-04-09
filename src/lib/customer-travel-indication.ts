/** Retourafstand (heen + terug) in km: gratis onder deze drempel. */
export const CUSTOMER_TRAVEL_FREE_UNDER_RETURN_KM = 30;
/** Indicatie € per km over de retourafstand (heen én terug). */
export const CUSTOMER_TRAVEL_EURO_PER_RETURN_KM = 0.23;

/**
 * Klantindicatie reiskosten: €0,23 per km retour, €0 als retourafstand < 30 km.
 */
export function customerTravelIndicationEuros(returnTripKm: number): {
  costEuro: number;
  returnKmRounded: number;
} {
  const returnKmRounded = Math.round(returnTripKm * 10) / 10;
  if (returnTripKm < CUSTOMER_TRAVEL_FREE_UNDER_RETURN_KM) {
    return { costEuro: 0, returnKmRounded };
  }
  const costEuro =
    Math.round(returnTripKm * CUSTOMER_TRAVEL_EURO_PER_RETURN_KM * 100) / 100;
  return { costEuro, returnKmRounded };
}
