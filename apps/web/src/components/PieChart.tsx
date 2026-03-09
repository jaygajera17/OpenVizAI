import Chart from "react-apexcharts";
import type { PieChartVariant } from "../config/pieChartExamples";
import { useChartState } from "../context/chartContext";
import { buildApexBaseOptions } from "../utils/apexBaseOptions";
import {
  buildCategorySeriesLabels,
  buildSingleValueSeries,
} from "../utils/seriesBuilder";

type PieChartProps = {
  variant: PieChartVariant;
};

export default function PieChart({ variant }: PieChartProps) {
  const { result } = variant;
  const { embedding } = result.chart;
  const { rows } = useChartState();

  const categoryField = embedding.category?.[0]?.field;
  const valueField = embedding.value?.[0]?.field;

  if (!categoryField || !valueField) {
    return null;
  }

  const labels = buildCategorySeriesLabels(rows, categoryField);
  const series = buildSingleValueSeries(rows, valueField);

  const chartType =
    result.chart.chart_type === "donut" || embedding.is_donut
      ? ("donut" as const)
      : ("pie" as const);

  const baseOptions = buildApexBaseOptions({
    chartId: result.meta.title || "pie-chart",
    title: result.meta.title,
    subtitle: result.meta.subtitle,
    legendPosition: "right",
    dataLabelsEnabled: true,
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
          size: chartType === "donut" ? "60%" : "0%",
          labels: {
            show: chartType === "donut",
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
      type={chartType}
      width="100%"
      height={350}
      options={options}
      series={series}
    />
  );
}
