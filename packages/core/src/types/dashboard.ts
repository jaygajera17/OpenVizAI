import type { ChartType } from "@openvizai/shared-types";
import type { ChartEmbedding } from "./embedding";
import type { ChartMeta } from "./chart";
import type { AnalyzeChartConfig } from "./api";

export interface DashboardChartItem {
  /** Which chart type this item uses */
  chart_type: ChartType;
  /** Full embedding ready for OpenVizRenderer */
  embedding: ChartEmbedding;
  /** Title / subtitle / explanation for this specific chart */
  meta: ChartMeta;
}

export interface DashboardResult {
  response_type: "dashboard";
  charts: DashboardChartItem[];
}

export interface AnalyzeDashboardInput {
  prompt: string;
  data: Record<string, unknown>[];
  config?: AnalyzeChartConfig;
  /** Optional: restrict to specific chart types. If omitted, LLM decides. */
  charts?: ChartType[];
  /** Optional: max number of charts. If omitted, LLM decides (capped at 6). */
  maxCharts?: number;
}

export interface AnalyzeDashboardResult {
  result: DashboardResult;
  sampleUsed: Record<string, unknown>[];
}
