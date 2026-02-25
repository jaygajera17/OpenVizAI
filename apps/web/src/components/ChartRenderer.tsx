import LineChart from "./LineChart";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import type { LineChartVariant } from "../config/lineChartExamples";
import type { PieChartVariant } from "../config/pieChartExamples";
import type { BarChartVariant } from "../config/barChartExamples";

type ChartVariant = LineChartVariant | PieChartVariant | BarChartVariant;

type ChartRendererProps = {
  variant: ChartVariant;
};

export default function ChartRenderer({ variant }: ChartRendererProps) {
  const chartType = variant.result.chart.chart_type;

  if (chartType === "line") {
    return <LineChart variant={variant as LineChartVariant} />;
  }

  if (chartType === "pie" || chartType === "donut") {
    return <PieChart variant={variant as PieChartVariant} />;
  }

  if (chartType === "bar" || chartType === "range_bar") {
    return <BarChart variant={variant as BarChartVariant} />;
  }

  return null;
}

