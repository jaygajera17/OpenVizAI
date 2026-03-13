import Chart from "react-apexcharts";
import type { ChartComponentProps } from "./types.js";
import { buildApexBaseOptions } from "../embedding/apexBaseOptions.js";
import {
  buildCategorySeriesLabels,
  buildDatetimePoints,
  buildNumericDataByField,
} from "../embedding/seriesBuilder.js";

export default function LineChart({
  data,
  embedding,
  meta,
  config,
}: ChartComponentProps) {
  const xField = embedding.x?.[0]?.field;
  const isDatetime = embedding.x?.[0]?.unit === "datetime";
  const yFields = embedding.y ?? [];

  if (!xField || yFields.length === 0) {
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
          Unable to render line chart: missing required x-axis or y-axis fields.
        </p>
      </div>
    );
  }

  const baseOptions = buildApexBaseOptions({
    chartId: meta?.title || "line-chart",
    title: meta?.title,
    subtitle: meta?.subtitle,
    legendPosition: config?.legendPosition ?? "top",
    dataLabelsEnabled: config?.dataLabelsEnabled ?? false,
    toolbarVisible: config?.toolbarVisible,
  });

  const categories =
    xField && !isDatetime ? buildCategorySeriesLabels(data, xField) : undefined;

  // Build distinct units to drive multi-axis behavior
  const unitKeys = Array.from(
    new Set(yFields.map((yField) => (yField.unit ? yField.unit : "default"))),
  );

  const series = yFields.map((yField) => {
    const axisKey = yField.unit ? yField.unit : "default";
    const yAxisIndex = unitKeys.indexOf(axisKey);

    const base = {
      name: yField.label || yField.field,
      type: (yField.type as "line" | "column" | undefined) ?? "line",
      yAxisIndex,
    };

    if (isDatetime && xField) {
      return {
        ...base,
        data: buildDatetimePoints(data, xField, yField.field),
      };
    }

    return {
      ...base,
      data: buildNumericDataByField(data, yField.field),
    };
  });

  const yaxis =
    unitKeys.length > 1
      ? unitKeys.map((unit, idx) => ({
          title: {
            text: unit === "default" ? undefined : unit,
          },
          opposite: idx % 2 === 1,
        }))
      : {
          labels: {
            formatter: (val: number) => `${val}`,
          },
        };

  const options = {
    ...baseOptions,
    chart: {
      ...baseOptions.chart,
      stacked: embedding.is_stacked,
      animations: {
        enabled: config?.animations ?? true,
      },
    },
    xaxis: {
      ...(categories ? { categories } : {}),
      type: isDatetime ? ("datetime" as const) : ("category" as const),
      title: {
        text: embedding.x?.[0]?.label ?? undefined,
      },
    },
    yaxis,
    tooltip: {
      shared: true,
      intersect: false,
    },
    stroke: {
      curve: (embedding.line_curve ?? "smooth") as
        | "smooth"
        | "straight"
        | "stepline",
      width: 2,
    },
    markers: {
      size: embedding.markers_size ?? 0,
    },
    ...(embedding.forecast_points
      ? {
          forecastDataPoints: {
            count: embedding.forecast_points,
          },
        }
      : {}),
  };

  return (
    <Chart
      type="line"
      width={config?.width ?? "100%"}
      height={config?.height ?? 350}
      options={options}
      series={series}
    />
  );
}
