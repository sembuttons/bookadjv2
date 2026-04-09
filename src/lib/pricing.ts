/**
 * bookadj pricing utilities
 * Customer pays: DJ rate + Boekingsbescherming (10%, min €15, max €150)
 * DJ receives: 100% of their stated rate
 */

export function calculateServiceFee(djRate: number): number {
  const raw = djRate * 0.1;
  const clamped = Math.max(15, Math.min(150, raw));
  return Math.ceil(clamped);
}

export function calculateTotalPrice(djRate: number): number {
  return djRate + calculateServiceFee(djRate);
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

