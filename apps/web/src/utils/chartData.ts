// Shared data coercion helpers used by chart components and series builders.
export function toFiniteNumber(value: unknown, fallback = 0): number {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

// Normalizes category labels so axis/legend text never receives null/undefined.
export function toCategoryString(value: unknown): string {
  return String(value ?? "");
}

// Converts number/date-like values into epoch milliseconds for datetime charts.
export function toMilliseconds(value: unknown): number {
  if (value === undefined || value === null) return Number.NaN;
  if (typeof value === "number") return value;

  const parsed = new Date(String(value)).getTime();
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}
