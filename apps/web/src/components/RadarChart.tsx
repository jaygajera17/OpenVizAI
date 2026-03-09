import Chart from "react-apexcharts";
import type { LineChartVariant } from "../config/lineChartExamples";
import { useChartState } from "../context/chartContext";
import { buildApexBaseOptions } from "../utils/apexBaseOptions";
import {
  buildCategorySeriesLabels,
  buildNumericSeries,
} from "../utils/seriesBuilder";

type RadarChartProps = {
  variant: LineChartVariant;
};

export default function RadarChart({ variant }: RadarChartProps) {
  const { result } = variant;
  const { rows } = useChartState();

  if (result.chart.chart_type !== "radar") {
    return null;
  }

  const { embedding } = result.chart;
  const xField = embedding.x[0]?.field;

  if (!xField) {
    return null;
  }

  const labels = buildCategorySeriesLabels(rows, xField);
  const series = buildNumericSeries(rows, embedding.y);

  const baseOptions = buildApexBaseOptions({
    chartId: result.meta.title || "radar-chart",
    title: result.meta.title,
    subtitle: result.meta.subtitle,
    legendPosition: "top",
    dataLabelsEnabled: false,
  });

  const options = {
    ...baseOptions,
    labels,
    xaxis: {
      categories: labels,
      title: {
        text: embedding.x[0]?.label ?? undefined,
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
      width="100%"
      height={350}
      options={options}
      series={series}
    />
  );
}
