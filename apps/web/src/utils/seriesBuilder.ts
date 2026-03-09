import { toCategoryString, toFiniteNumber, toMilliseconds } from "./chartData";

/*
Usage examples:

Bar/Column:
const categories = buildCategorySeriesLabels(rows, "month");
const series = buildNumericSeries(rows, [
  { field: "revenue", label: "Revenue" },
  { field: "expenses", label: "Expenses" },
]);

Line (datetime):
const points = buildDatetimePoints(rows, "date", "signups");
const lineSeries = [{ name: "Signups", data: points }];

Pie/Donut:
const labels = buildCategorySeriesLabels(rows, "department");
const values = buildSingleValueSeries(rows, "spend");

Range Bar:
const rangeData = buildRangeBarPoints(rows, "project", "start", "end");
*/

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
export function buildNumericSeries(rows: Row[], yFields: YFieldLike[]) {
  return yFields.map((yField) => ({
    name: yField.label || yField.field,
    data: rows.map((row) => toFiniteNumber(row[yField.field])),
  }));
}

// Builds numeric data for one field; useful when component needs custom series metadata.
export function buildNumericDataByField(rows: Row[], yField: string): number[] {
  return rows.map((row) => toFiniteNumber(row[yField]));
}

// Builds pie/donut numeric values from a single field.
export function buildSingleValueSeries(
  rows: Row[],
  valueField: string,
): number[] {
  return rows.map((row) => toFiniteNumber(row[valueField]));
}

// Builds datetime points for ApexCharts time-series format: { x: timestamp, y: number }.
export function buildDatetimePoints(
  rows: Row[],
  xField: string,
  yField: string,
): Array<{ x: number; y: number }> {
  return rows.map((row) => ({
    x: toMilliseconds(row[xField]),
    y: toFiniteNumber(row[yField]),
  }));
}

// Builds range-bar points for ApexCharts format: { x: category, y: [start, end] }.
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
