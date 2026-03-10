import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage } from "@langchain/core/messages";
import { dashboardPlannerPrompt } from "../prompts/dashboardPlannerPrompt";
import { dashboardResponseSchema } from "../config/dashboardSchema";
import { LLMError } from "../errors/index";
import type { ResolvedConfig } from "../config/defaults";
import type { DashboardChartItem } from "../types/dashboard";
import type { SchemaInfo } from "../analysis/schemaInspector";
import type { ChartType } from "@openvizai/shared-types";

export interface GenerateDashboardEmbeddingsOptions {
  prompt: string;
  sampleData: { columns: string[]; rows: string[][] };
  config: ResolvedConfig;
  schema?: SchemaInfo;
  charts?: ChartType[];
  maxCharts?: number;
}

export async function generateDashboardEmbeddings(
  options: GenerateDashboardEmbeddingsOptions,
): Promise<DashboardChartItem[]> {
  const { prompt, sampleData, config, schema, charts, maxCharts } = options;

  try {
    const model = new ChatOpenAI({
      apiKey: config.apiKey,
      model: config.model,
      maxRetries: config.maxRetries,
      ...(config.baseURL ? { configuration: { baseURL: config.baseURL } } : {}),
    });

    const systemMessage = new SystemMessage(
      dashboardPlannerPrompt(prompt, sampleData, schema, charts, maxCharts),
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const structuredModel = (model as any).withStructuredOutput(
      dashboardResponseSchema,
    );
    const response = await structuredModel.invoke([systemMessage]);

    return (response as { charts: DashboardChartItem[] }).charts;
  } catch (err) {
    if (err instanceof LLMError) throw err;
    throw new LLMError(
      `Failed to generate dashboard embeddings: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
