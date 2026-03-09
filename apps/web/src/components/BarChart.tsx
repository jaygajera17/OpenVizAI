import Chart from "react-apexcharts";
import type { BarChartVariant } from "../config/barChartExamples";
import { useChartState } from "../context/chartContext";
import { buildApexBaseOptions } from "../utils/apexBaseOptions";
import {
  buildCategorySeriesLabels,
  buildNumericSeries,
  buildRangeBarPoints,
} from "../utils/seriesBuilder";

type BarChartProps = {
  variant: BarChartVariant;
};

export default function BarChart({ variant }: BarChartProps) {
  const { result } = variant;
  const { embedding } = result.chart;
  const { rows } = useChartState();

  const apexType =
    result.chart.chart_type === "range_bar" || embedding.is_range
      ? ("rangeBar" as const)
      : ("bar" as const);

  const xField = embedding.x[0]?.field;
  const baseOptions = buildApexBaseOptions({
    chartId: result.meta.title || "bar-chart",
    title: result.meta.title,
    subtitle: result.meta.subtitle,
    legendPosition: "top",
    dataLabelsEnabled: false,
  });

  let series;

  if (embedding.is_range && embedding.start && embedding.end && xField) {
    // Range bar chart: data points as { x: category, y: [start, end] }
    series = [
      {
        name: `${embedding.start.label ?? "Start"} - ${
          embedding.end.label ?? "End"
        }`,
        data: buildRangeBarPoints(
          rows,
          xField,
          embedding.start.field,
          embedding.end.field,
        ),
      },
    ];
  } else {
    // Standard bar/column chart (supports stacked, multi-series)
    const categories = xField ? buildCategorySeriesLabels(rows, xField) : [];

    series = buildNumericSeries(rows, embedding.y);

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
          text: embedding.x[0]?.label ?? undefined,
        },
      },
    };

    return (
      <Chart
        type={apexType}
        width="100%"
        height={350}
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
      id: result.meta.title || "range-bar-chart",
    },
    plotOptions: {
      bar: {
        horizontal: embedding.is_horizontal,
      },
    },
    xaxis: {
      type:
        embedding.start?.unit === "datetime" ||
        embedding.end?.unit === "datetime"
          ? ("datetime" as const)
          : ("category" as const),
    },
  };

  return (
    <Chart
      type={apexType}
      width="100%"
      height={350}
      options={rangeOptions}
      series={series}
    />
  );
}
