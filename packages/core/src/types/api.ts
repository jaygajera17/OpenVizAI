import type { ChartResult } from "./chart";

export interface AnalyzeChartConfig {
  provider?: "openai" | "google";
  apiKey?: string;
  model?: string;
  sampleRows?: number;
}

export interface AnalyzeChartInput {
  prompt: string;
  data: Record<string, unknown>[];
  config?: AnalyzeChartConfig;
}

export interface AnalyzeChartResult {
  result: ChartResult;
  sampleUsed: Record<string, unknown>[];
}
