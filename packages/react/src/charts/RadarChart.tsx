import Chart from "react-apexcharts";
import type { ChartComponentProps } from "./types";
import { buildApexBaseOptions } from "../embedding/apexBaseOptions";
import {
  buildCategorySeriesLabels,
  buildNumericSeries,
} from "../embedding/seriesBuilder";

export default function RadarChart({
  data,
  embedding,
  meta,
  config,
}: ChartComponentProps) {
  const xField = embedding.x?.[0]?.field;
  const yFields = embedding.y ?? [];

  if (!xField) {
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
          Unable to render radar chart: missing required x-axis field.
        </p>
      </div>
    );
  }

  const labels = buildCategorySeriesLabels(data, xField);
  const series = buildNumericSeries(data, yFields);

  const baseOptions = buildApexBaseOptions({
    chartId: meta?.title || "radar-chart",
    title: meta?.title,
    subtitle: meta?.subtitle,
    legendPosition: config?.legendPosition ?? "top",
    dataLabelsEnabled: config?.dataLabelsEnabled ?? false,
    toolbarVisible: config?.toolbarVisible,
  });

  const options = {
    ...baseOptions,
    labels,
    xaxis: {
      categories: labels,
      title: {
        text: embedding.x?.[0]?.label ?? undefined,
      },
    },
    stroke: {
      width: 2,
    },
    fill: {
      opacity: 0.2,
    },
    markers: {
      size: embedding.markers_size ?? 3,
    },
  };

  return (
    <Chart
      type="radar"
      width={config?.width ?? "100%"}
      height={config?.height ?? 350}
      options={options}
      series={series}
    />
  );
}
