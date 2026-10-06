export const PROJECT_COLORS = ["#44D4CD", "#D9776A", "#65458A", "#D6A84F", "#5C78D6", "#6FA889"];

// Retired preset values remain here only to migrate existing local/cloud data.
export function normalizeProjectColor(color: string): string {
  return ["#8951c7"].includes(color?.toLowerCase()) ? "#D6A84F" : color;
}
