import Chart from "react-apexcharts";
import type { LineChartVariant } from "../config/lineChartExamples";

type LineChartProps = {
  variant: LineChartVariant;
};

export default function LineChart({ variant }: LineChartProps) {
  const { result, rows } = variant;

  if (result.chart.chart_type !== "line") {
    // For safety: this component only handles line charts
    return null;
  }

  const { embedding } = result.chart;
  const xField = embedding.x[0]?.field;
  const isDatetime = embedding.x[0]?.unit === "datetime";

  const categories =
    xField && !isDatetime
      ? rows.map((row) => String(row[xField] ?? ""))
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
        data: rows.map((row) => {
          const xRaw = row[xField];
          const time =
            typeof xRaw === "number"
              ? xRaw
              : new Date(String(xRaw)).getTime();
          const value = row[yField.field];
          const numeric = typeof value === "number" ? value : Number(value);
          return {
            x: time,
            y: Number.isFinite(numeric) ? numeric : 0,
          };
        }),
      };
    }

    return {
      ...base,
      data: rows.map((row) => {
        const value = row[yField.field];
        const numeric = typeof value === "number" ? value : Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
      }),
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
    chart: {
      id: result.meta.title || "line-chart",
      stacked: embedding.is_stacked,
      toolbar: {
        show: true,
      },
      animations: {
        enabled: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      ...(categories ? { categories } : {}),
      type: isDatetime ? ("datetime" as const) : ("category" as const),
      title: {
        text: embedding.x[0]?.label ?? undefined,
      },
    },
    yaxis,
    legend: {
      position: "top" as const,
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    title: {
      text: result.meta.title,
      align: "left" as const,
    },
    subtitle: {
      text: result.meta.subtitle ?? undefined,
      align: "left" as const,
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
