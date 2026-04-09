/** Great-circle distance in km (WGS84 approximation). */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Match booking flow: single trip × road factor × return, then × €/km.
 * `crowKm` = straight-line km between DJ base and venue.
 */
export function travelCostFromCrowKm(crowKm: number, ratePerKm: number): {
  distanceKmRounded: number;
  costEuro: number;
} {
  const roadReturnTrip = crowKm * 1.3 * 2;
  const distanceKmRounded = Math.round(roadReturnTrip);
  const costEuro = Math.round(roadReturnTrip * ratePerKm);
  return { distanceKmRounded, costEuro };
}
