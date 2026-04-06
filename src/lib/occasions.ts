import type { DjProfileRow } from "@/lib/dj-profile-helpers";

/** Stored in `dj_profiles.occasions` (jsonb text array). */
export const OCCASION_OPTIONS = [
  { id: "bruiloft", label: "Bruiloft" },
  { id: "verjaardag", label: "Verjaardag" },
  { id: "bedrijfsfeest", label: "Bedrijfsfeest" },
  { id: "afstuderen", label: "Afstuderen" },
  { id: "festival", label: "Festival" },
  { id: "club_bar", label: "Club/Bar" },
  { id: "huisfeest", label: "Huisfeest" },
  { id: "anders", label: "Anders" },
] as const;

export type OccasionId = (typeof OCCASION_OPTIONS)[number]["id"];

export function occasionLabel(id: string): string {
  const o = OCCASION_OPTIONS.find((x) => x.id === id);
  return o?.label ?? id;
}

export function getOccasions(row: DjProfileRow): string[] {
  const o = row.occasions;
  if (Array.isArray(o)) {
    return o.filter((x): x is string => typeof x === "string" && x.length > 0);
  }
  return [];
}

/** No stored occasions → treat as available for all (legacy profiles). */
export function profileMatchesOccasion(
  row: DjProfileRow,
  occasionId: string | null | undefined,
): boolean {
  if (!occasionId || !occasionId.trim()) return true;
  const occ = getOccasions(row);
  if (occ.length === 0) return true;
  return occ.includes(occasionId.trim());
}
