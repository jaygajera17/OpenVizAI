import Chart from "react-apexcharts";
import type { BarChartVariant } from "../config/barChartExamples";

type BarChartProps = {
  variant: BarChartVariant;
};

export default function BarChart({ variant }: BarChartProps) {
  const { result, rows } = variant;
  const { embedding } = result.chart;

  const apexType =
    result.chart.chart_type === "range_bar" || embedding.is_range
      ? ("rangeBar" as const)
      : ("bar" as const);

  const xField = embedding.x[0]?.field;

  let series;

  if (embedding.is_range && embedding.start && embedding.end && xField) {
    // Range bar chart: data points as { x: category, y: [start, end] }
    series = [
      {
        name: `${embedding.start.label ?? "Start"} - ${
          embedding.end.label ?? "End"
        }`,
        data: rows.map((row) => {
          const xValue = row[xField];
          const startRaw = row[embedding.start!.field];
          const endRaw = row[embedding.end!.field];

          const toTime = (val: string | number | undefined) => {
            if (val === undefined || val === null) return NaN;
            if (typeof val === "number") return val;
            const t = new Date(String(val)).getTime();
            return t;
          };

          const start = toTime(startRaw as string | number | undefined);
          const end = toTime(endRaw as string | number | undefined);

          return {
            x: String(xValue ?? ""),
            y: [start, end],
          };
        }),
      },
    ];
  } else {
    // Standard bar/column chart (supports stacked, multi-series)
    const categories = xField
      ? rows.map((row) => String(row[xField] ?? ""))
      : [];

    series = embedding.y.map((yField) => ({
      name: yField.label || yField.field,
      data: rows.map((row) => {
        const value = row[yField.field];
        const numeric = typeof value === "number" ? value : Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
      }),
    }));

    const options = {
      chart: {
        id: result.meta.title || "bar-chart",
        stacked: embedding.is_stacked,
        toolbar: {
          show: true,
        },
      },
      plotOptions: {
        bar: {
          horizontal: embedding.is_horizontal,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories,
        title: {
          text: embedding.x[0]?.label ?? undefined,
        },
      },
      legend: {
        position: "top" as const,
      },
      title: {
        text: result.meta.title,
        align: "left" as const,
      },
      subtitle: {
        text: result.meta.subtitle ?? undefined,
        align: "left" as const,
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
    chart: {
      id: result.meta.title || "range-bar-chart",
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      bar: {
        horizontal: embedding.is_horizontal,
      },
    },
    xaxis: {
      type:
        embedding.start?.unit === "datetime" || embedding.end?.unit === "datetime"
          ? ("datetime" as const)
          : ("category" as const),
    },
    title: {
      text: result.meta.title,
      align: "left" as const,
    },
    subtitle: {
      text: result.meta.subtitle ?? undefined,
      align: "left" as const,
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

