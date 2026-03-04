import Chart from "react-apexcharts";
import type { PieChartVariant } from "../config/pieChartExamples";
import { useChartState } from "../context/chartContext";

type PieChartProps = {
  variant: PieChartVariant;
};

export default function PieChart({ variant }: PieChartProps) {
  const { result } = variant;
  const { embedding } = result.chart;
  const { rows } = useChartState();
  

  const categoryField = embedding.category?.[0]?.field;
const valueField = embedding.value?.[0]?.field;

  const labels = rows.map((row) => String(row[categoryField] ?? ""));
  const series = rows.map((row) => {
    const value = row[valueField];
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  });

  const chartType =
    result.chart.chart_type === "donut" || embedding.is_donut
      ? ("donut" as const)
      : ("pie" as const);

  const options = {
    labels,
    chart: {
      id: result.meta.title || "pie-chart",
    },
    title: {
      text: result.meta.title,
      align: "left" as const,
    },
    subtitle: {
      text: result.meta.subtitle ?? undefined,
      align: "left" as const,
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    legend: {
      position: "right" as const,
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

