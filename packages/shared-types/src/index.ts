/**
 * Canonical list of supported ApexChart types for OpenVizAI.
 * Single source of truth used across:
 *   - Frontend: type safety, ChartRenderer dispatch, config examples
 *   - Backend:  Zod schema validation, LLM prompt generation
 *
 * To add a new chart type, add it here — the Zod enum, prompt, and TS types
 * all update automatically wherever SUPPORTED_CHART_TYPES is referenced.
 */
export const SUPPORTED_CHART_TYPES = [
  "line",
  "bar",
  "range_bar",
  "pie",
  "donut",
] as const;

/** Union of all supported chart type strings: "line" | "bar" | "range_bar" | "pie" | "donut" */
export type ChartType = (typeof SUPPORTED_CHART_TYPES)[number];
