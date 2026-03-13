import type { ChartType } from "@openvizai/shared-types";
import type { ChartEmbedding, ChartMeta, OpenVizConfig } from "./renderer.js";

/** A single chart item for the dashboard */
export type DashboardChartItem = {
  chart_type: ChartType;
  embedding: ChartEmbedding;
  meta: ChartMeta;
};

/** Props for the <OpenVizDashboard /> component */
export type OpenVizDashboardProps = {
  /** The dataset rows — shared across all charts */
  data: Record<string, unknown>[];
  /** Array of chart configurations returned by analyzeDashboard */
  charts: DashboardChartItem[];
  /** Optional rendering config applied to all charts */
  config?: OpenVizConfig;
  /** Number of columns in the grid (default: 2) */
  columns?: number;
  /** Optional CSS class name for the wrapper */
  className?: string;
};
