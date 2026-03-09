// Main component
export { default as OpenVizRenderer } from "./OpenVizRenderer";

// Chart registry (for plugin system)
export {
  registerChart,
  getChartComponent,
  resetChartRegistry,
} from "./charts/registry";

// Individual chart components (for advanced usage)
export { LineChart, BarChart, PieChart, RadarChart } from "./charts";

// Types
export type {
  EmbeddingField,
  ChartEmbedding,
  ChartMeta,
  OpenVizConfig,
  OpenVizRendererProps,
} from "./types";

// Internal chart component props type (for custom chart registration)
export type { ChartComponentProps } from "./charts/types";

// Re-export chart type constants
export { SUPPORTED_CHART_TYPES } from "@openvizai/shared-types";
export type { ChartType } from "@openvizai/shared-types";
