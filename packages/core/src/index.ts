// Main entry point
export { analyzeChart } from "./analysis/analyzeChart";
export type { AnalyzeChartOptions } from "./analysis/analyzeChart";

// Types
export type {
  ChartMeta,
  ChartResult,
  ChartType,
  AnalyzeChartConfig,
  AnalyzeChartInput,
  AnalyzeChartResult,
  EmbeddingField,
  EmbeddingFieldWithType,
  ChartEmbedding,
} from "./types/index";

// Errors
export {
  OpenVizAIError,
  InvalidInputError,
  LLMError,
  ConfigError,
} from "./errors/index";

// Re-export chart type constants
export { SUPPORTED_CHART_TYPES } from "@openvizai/shared-types";
