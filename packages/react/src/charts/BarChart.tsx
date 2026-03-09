import Chart from "react-apexcharts";
import type { ChartComponentProps } from "./types";
import type { EmbeddingField } from "../types";
import { buildApexBaseOptions } from "../embedding/apexBaseOptions";
import {
  buildCategorySeriesLabels,
  buildNumericSeries,
  buildRangeBarPoints,
} from "../embedding/seriesBuilder";

// Normalize start/end which can be either a single EmbeddingField or EmbeddingField[]
function normalizeField(
  field: EmbeddingField | EmbeddingField[] | null | undefined,
): EmbeddingField | undefined {
  if (!field) return undefined;
  if (Array.isArray(field)) return field[0];
  return field;
}

export default function BarChart({ data, chartType, embedding, meta, config }: ChartComponentProps) {
  const apexType =
    chartType === "range_bar" || embedding.is_range
      ? ("rangeBar" as const)
      : ("bar" as const);

  const xField = embedding.x?.[0]?.field;
  const yFields = embedding.y ?? [];
  const startField = normalizeField(embedding.start);
  const endField = normalizeField(embedding.end);

  const baseOptions = buildApexBaseOptions({
    chartId: meta?.title || "bar-chart",
    title: meta?.title,
    subtitle: meta?.subtitle,
    legendPosition: config?.legendPosition ?? "top",
    dataLabelsEnabled: config?.dataLabelsEnabled ?? false,
    toolbarVisible: config?.toolbarVisible,
  });

  let series;

  if (embedding.is_range && startField && endField && xField) {
    // Range bar chart: data points as { x: category, y: [start, end] }
    series = [
      {
        name: `${startField.label ?? "Start"} - ${endField.label ?? "End"}`,
        data: buildRangeBarPoints(
          data,
          xField,
          startField.field,
          endField.field,
        ),
      },
    ];
  } else {
    // Standard bar/column chart (supports stacked, multi-series)
    const categories = xField ? buildCategorySeriesLabels(data, xField) : [];

    series = buildNumericSeries(data, yFields);

    const options = {
      ...baseOptions,
      chart: {
        ...baseOptions.chart,
        stacked: embedding.is_stacked,
      },
      plotOptions: {
        bar: {
          horizontal: embedding.is_horizontal,
        },
      },
      xaxis: {
        categories,
        title: {
          text: embedding.x?.[0]?.label ?? undefined,
        },
      },
    };

    return (
      <Chart
        type={apexType}
        width={config?.width ?? "100%"}
        height={config?.height ?? 350}
        options={options}
        series={series}
      />
    );
  }

  // Options for range bar (x-axis usually category or datetime)
  const rangeOptions = {
    ...baseOptions,
    chart: {
      ...baseOptions.chart,
      id: meta?.title || "range-bar-chart",
    },
    plotOptions: {
      bar: {
        horizontal: embedding.is_horizontal,
      },
    },
    xaxis: {
      type:
        startField?.unit === "datetime" || endField?.unit === "datetime"
          ? ("datetime" as const)
          : ("category" as const),
    },
  };

  return (
    <Chart
      type={apexType}
      width={config?.width ?? "100%"}
      height={config?.height ?? 350}
      options={rangeOptions}
      series={series}
    />
  );
}
