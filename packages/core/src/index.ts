// Main entry point — single chart
export { analyzeChart } from "./analysis/analyzeChart";
export type { AnalyzeChartOptions } from "./analysis/analyzeChart";

// Dashboard — multi chart
export { analyzeDashboard } from "./analysis/analyzeDashboard";

// Schema validation
export { responseFormatterSchema } from "./config/zodSchemas";

// Schema inspection
export { inspectSchema } from "./analysis/schemaInspector";
export type { SchemaColumn, SchemaInfo } from "./analysis/schemaInspector";

// Post-LLM validation
export { validateEmbeddingConsistency } from "./utils/embeddingValidator";

// Prompt (for consumers who need the raw prompt template)
export { responseFormatterPrompt } from "./prompts/responseFormatterPrompt";

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

export type {
  DashboardChartItem,
  DashboardResult,
  AnalyzeDashboardInput,
  AnalyzeDashboardResult,
} from "./types/dashboard";

// Errors
export {
  OpenVizAIError,
  InvalidInputError,
  LLMError,
  ConfigError,
} from "./errors/index";

// Re-export chart type constants
export { SUPPORTED_CHART_TYPES } from "@openvizai/shared-types";
