import { useId } from "react";
import Chart from "react-apexcharts";
import type { ChartComponentProps } from "./types.js";
import type { EmbeddingField } from "../types/index.js";
import { buildApexBaseOptions } from "../embedding/apexBaseOptions.js";
import {
  buildCategorySeriesLabels,
  buildNumericSeries,
  buildRangeBarPoints,
} from "../embedding/seriesBuilder.js";

// Normalize start/end which can be either a single EmbeddingField or EmbeddingField[]
function normalizeField(
  field: EmbeddingField | EmbeddingField[] | null | undefined,
): EmbeddingField | undefined {
  if (!field) return undefined;
  if (Array.isArray(field)) return field[0];
  return field;
}

function isNumericLike(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (typeof value === "number") return Number.isFinite(value);
  const parsed = Number(value);
  return Number.isFinite(parsed);
}

function inferRangeFields(
  rows: Record<string, unknown>[],
  xField: string | undefined,
  yFields: EmbeddingField[],
  startField: EmbeddingField | undefined,
  endField: EmbeddingField | undefined,
): {
  xField: string | undefined;
  startField: EmbeddingField | undefined;
  endField: EmbeddingField | undefined;
} {
  let resolvedX = xField;
  let resolvedStart = startField;
  let resolvedEnd = endField;

  if ((!resolvedStart || !resolvedEnd) && yFields.length >= 2) {
    resolvedStart = resolvedStart ?? {
      field: yFields[0].field,
      label: yFields[0].label,
    };
    resolvedEnd = resolvedEnd ?? {
      field: yFields[1].field,
      label: yFields[1].label,
    };
  }

  if ((!resolvedStart || !resolvedEnd) && rows.length > 0) {
    const sample = rows[0] ?? {};
    const keys = Object.keys(sample);
    const numericKeys = keys.filter(
      (key) => key !== resolvedX && rows.some((row) => isNumericLike(row[key])),
    );

    if (!resolvedStart && numericKeys[0]) {
      resolvedStart = { field: numericKeys[0], label: numericKeys[0] };
    }
    if (!resolvedEnd && numericKeys[1]) {
      resolvedEnd = { field: numericKeys[1], label: numericKeys[1] };
    }
  }

  if (!resolvedX && rows.length > 0) {
    const sample = rows[0] ?? {};
    const keys = Object.keys(sample);
    const categoricalKey = keys.find(
      (key) =>
        key !== resolvedStart?.field &&
        key !== resolvedEnd?.field &&
        !rows.some((row) => isNumericLike(row[key])),
    );

    resolvedX = categoricalKey ?? keys[0];
  }

  return {
    xField: resolvedX,
    startField: resolvedStart,
    endField: resolvedEnd,
  };
}

export default function BarChart({
  data,
  chartType,
  embedding,
  meta,
  config,
}: ChartComponentProps) {
  const instanceId = useId();
  const isRangeChart = chartType === "range_bar" || embedding.is_range;

  const apexType = isRangeChart ? ("rangeBar" as const) : ("bar" as const);
  const chartId = `${meta?.title || "bar-chart"}-${apexType}-${instanceId}`;

  const xField = embedding.x?.[0]?.field;
  const yFields = embedding.y ?? [];
  const startField = normalizeField(embedding.start);
  const endField = normalizeField(embedding.end);

  const resolvedRangeFields = inferRangeFields(
    data,
    xField,
    yFields,
    startField,
    endField,
  );

  // Guard: bar/column needs either x+y or range fields
  if (
    !xField &&
    !resolvedRangeFields.xField &&
    !startField &&
    !resolvedRangeFields.startField
  ) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          color: "#6b7280",
          border: "1px dashed #d1d5db",
          borderRadius: "8px",
          backgroundColor: "#f9fafb",
        }}
      >
        <p style={{ margin: 0, fontSize: "14px" }}>
          Unable to render bar chart: missing required axis fields.
        </p>
      </div>
    );
  }

  const baseOptions = buildApexBaseOptions({
    chartId,
    title: meta?.title,
    subtitle: meta?.subtitle,
    legendPosition: config?.legendPosition ?? "top",
    dataLabelsEnabled: config?.dataLabelsEnabled ?? false,
    toolbarVisible: config?.toolbarVisible,
  });

  let series;

  if (
    isRangeChart &&
    resolvedRangeFields.startField &&
    resolvedRangeFields.endField &&
    resolvedRangeFields.xField
  ) {
    // Range bar chart: data points as { x: category, y: [start, end] }
    series = [
      {
        name: `${resolvedRangeFields.startField.label ?? "Start"} - ${resolvedRangeFields.endField.label ?? "End"}`,
        data: buildRangeBarPoints(
          data,
          resolvedRangeFields.xField,
          resolvedRangeFields.startField.field,
          resolvedRangeFields.endField.field,
        ),
      },
    ];

    if (!series[0].data || series[0].data.length === 0) {
      return (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            color: "#6b7280",
            border: "1px dashed #d1d5db",
            borderRadius: "8px",
            backgroundColor: "#f9fafb",
          }}
        >
          <p style={{ margin: 0, fontSize: "14px" }}>
            Unable to render range bar chart: no valid range points found.
          </p>
        </div>
      );
    }
  } else if (isRangeChart) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          color: "#6b7280",
          border: "1px dashed #d1d5db",
          borderRadius: "8px",
          backgroundColor: "#f9fafb",
        }}
      >
        <p style={{ margin: 0, fontSize: "14px" }}>
          Unable to render range bar chart: missing start/end fields.
        </p>
      </div>
    );
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
        key={chartId}
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
      id: chartId,
    },
    plotOptions: {
      bar: {
        horizontal: embedding.is_horizontal,
      },
    },
    xaxis: {
      type:
        resolvedRangeFields.startField?.unit === "datetime" ||
        resolvedRangeFields.endField?.unit === "datetime"
          ? ("datetime" as const)
          : ("category" as const),
    },
  };

  return (
    <Chart
      key={chartId}
      type={apexType}
      width={config?.width ?? "100%"}
      height={config?.height ?? 350}
      options={rangeOptions}
      series={series}
    />
  );
}
