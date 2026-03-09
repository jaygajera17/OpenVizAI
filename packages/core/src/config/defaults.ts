import type { AnalyzeChartConfig } from "../types/api";

export interface ResolvedConfig {
  apiKey: string;
  model: string;
  sampleRows: number;
  maxRetries: number;
  baseURL?: string;
}

export const DEFAULT_CONFIG = {
  model: "gpt-4.1-nano-2025-04-14",
  sampleRows: 3,
  maxRetries: 2,
} as const;

export function resolveConfig(config?: AnalyzeChartConfig): ResolvedConfig {
  const apiKey = config?.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "API key is required. Provide it via config.apiKey or the OPENAI_API_KEY environment variable.",
    );
  }

  return {
    apiKey,
    model: config?.model ?? DEFAULT_CONFIG.model,
    sampleRows: config?.sampleRows ?? DEFAULT_CONFIG.sampleRows,
    maxRetries: config?.maxRetries ?? DEFAULT_CONFIG.maxRetries,
    baseURL: config?.baseURL,
  };
}
