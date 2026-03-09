import type { ChartResult } from "./chart";

export interface AnalyzeChartConfig {
  apiKey?: string;
  model?: string;
  sampleRows?: number;
  maxRetries?: number;
  baseURL?: string;
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
