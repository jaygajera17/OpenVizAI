import { toCategoryString, toFiniteNumber, toMilliseconds } from "./chartData";

type Row = Record<string, unknown>;

type YFieldLike = {
  field: string;
  label?: string | null;
};

// Builds x-axis categories for category-based charts (bar/line/category modes).
export function buildCategorySeriesLabels(
  rows: Row[],
  xField: string,
): string[] {
  return rows.map((row) => toCategoryString(row[xField]));
}

// Builds numeric series used by bar-like and category-line charts.
// Returns null for missing values so ApexCharts can render gaps.
export function buildNumericSeries(rows: Row[], yFields: YFieldLike[]) {
  return yFields.map((yField) => ({
    name: yField.label || yField.field,
    data: rows.map((row) => toFiniteNumber(row[yField.field])),
  }));
}

// Builds numeric data for one field; null = gap in the chart.
export function buildNumericDataByField(
  rows: Row[],
  yField: string,
): (number | null)[] {
  return rows.map((row) => toFiniteNumber(row[yField]));
}

// Builds pie/donut numeric values from a single field.
// Pie charts cannot handle null, so fallback to 0.
export function buildSingleValueSeries(
  rows: Row[],
  valueField: string,
): number[] {
  return rows.map((row) => toFiniteNumber(row[valueField], 0) ?? 0);
}

// Builds datetime points for ApexCharts time-series format: { x: timestamp, y: number | null }.
export function buildDatetimePoints(
  rows: Row[],
  xField: string,
  yField: string,
): Array<{ x: number; y: number | null }> {
  return rows.map((row) => ({
    x: toMilliseconds(row[xField]),
    y: toFiniteNumber(row[yField]),
  }));
}

// Builds range-bar points for ApexCharts format: { x: category, y: [number, number] }.
export function buildRangeBarPoints(
  rows: Row[],
  xField: string,
  startField: string,
  endField: string,
): Array<{ x: string; y: [number, number] }> {
  return rows.map((row) => ({
    x: toCategoryString(row[xField]),
    y: [toMilliseconds(row[startField]), toMilliseconds(row[endField])],
  }));
}
