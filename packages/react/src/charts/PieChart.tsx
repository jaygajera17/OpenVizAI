import Chart from "react-apexcharts";
import type { ChartComponentProps } from "./types";
import { buildApexBaseOptions } from "../embedding/apexBaseOptions";
import {
  buildCategorySeriesLabels,
  buildSingleValueSeries,
} from "../embedding/seriesBuilder";

export default function PieChart({
  data,
  chartType,
  embedding,
  meta,
  config,
}: ChartComponentProps) {
  const categoryField = embedding.category?.[0]?.field;
  const valueField = embedding.value?.[0]?.field;

  if (!categoryField || !valueField) {
    return null;
  }

  const labels = buildCategorySeriesLabels(data, categoryField);
  const series = buildSingleValueSeries(data, valueField);

  const pieType =
    chartType === "donut" || embedding.is_donut
      ? ("donut" as const)
      : ("pie" as const);

  const baseOptions = buildApexBaseOptions({
    chartId: meta?.title || "pie-chart",
    title: meta?.title,
    subtitle: meta?.subtitle,
    legendPosition: config?.legendPosition ?? "right",
    dataLabelsEnabled: config?.dataLabelsEnabled ?? true,
    toolbarVisible: config?.toolbarVisible,
  });

  const options = {
    ...baseOptions,
    labels,
    dataLabels: {
      ...baseOptions.dataLabels,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    tooltip: {
      y: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: pieType === "donut" ? "60%" : "0%",
          labels: {
            show: pieType === "donut",
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
    <Chart
      type={pieType}
      width={config?.width ?? "100%"}
      height={config?.height ?? 350}
      options={options}
      series={series}
    />
  );
}
