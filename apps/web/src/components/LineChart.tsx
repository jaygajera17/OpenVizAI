import Chart from "react-apexcharts";
import type { LineChartVariant } from "../config/lineChartExamples";
import { useChartState } from "../context/chartContext";
import { buildApexBaseOptions } from "../utils/apexBaseOptions";
import {
  buildCategorySeriesLabels,
  buildDatetimePoints,
  buildNumericDataByField,
} from "../utils/seriesBuilder";

type LineChartProps = {
  variant: LineChartVariant;
};

export default function LineChart({ variant }: LineChartProps) {
  const { result } = variant;
  const { rows } = useChartState();

  if (result.chart.chart_type !== "line") {
    // For safety: this component only handles line charts
    return null;
  }

  const { embedding } = result.chart;
  const xField = embedding.x[0]?.field;
  const isDatetime = embedding.x[0]?.unit === "datetime";
  const baseOptions = buildApexBaseOptions({
    chartId: result.meta.title || "line-chart",
    title: result.meta.title,
    subtitle: result.meta.subtitle,
    legendPosition: "top",
    dataLabelsEnabled: false,
  });

  const categories =
    xField && !isDatetime
      ? buildCategorySeriesLabels(rows, xField)
      : undefined;

  // Build distinct units to drive multi-axis behavior (per ApexCharts multi-axis docs)
  const unitKeys = Array.from(
    new Set(
      embedding.y.map((yField) => (yField.unit ? yField.unit : "default")),
    ),
  );

  const series = embedding.y.map((yField) => {
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
        data: buildDatetimePoints(rows, xField, yField.field),
      };
    }

    return {
      ...base,
      data: buildNumericDataByField(rows, yField.field),
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
        enabled: true,
      },
    },
    xaxis: {
      ...(categories ? { categories } : {}),
      type: isDatetime ? ("datetime" as const) : ("category" as const),
      title: {
        text: embedding.x[0]?.label ?? undefined,
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
      width="100%"
      height={350}
      options={options}
      series={series}
    />
  );
}
