import type {
  AnalyzeDashboardInput,
  AnalyzeDashboardResult,
  DashboardChartItem,
} from "../types/dashboard";
import { resolveConfig } from "../config/defaults";
import { sampleDataset } from "./datasetSampler";
import { formatData } from "../utils/formatData";
import { validateInput } from "../utils/validation";
import { inspectSchema } from "./schemaInspector";
import { validateEmbeddingConsistency } from "../utils/embeddingValidator";
import { generateDashboardEmbeddings } from "../agents/dashboardAgent";

/**
 * Dashboard entry point for OpenVizAI core.
 *
 * Takes a user prompt and dataset, returns multiple chart type + embedding pairs.
 * Separate from analyzeChart — existing logic is untouched.
 */
export async function analyzeDashboard(
  input: AnalyzeDashboardInput,
): Promise<AnalyzeDashboardResult> {
  // 1. Validate input (same validation as single chart)
  validateInput(input);

  // 2. Resolve config — use a stronger model for dashboard (multi-chart output)
  const config = resolveConfig(input.config);

  // 3. Sample dataset
  const sampleUsed = sampleDataset(input.data, config.sampleRows);

  // 4. Inspect schema
  const schema = inspectSchema(sampleUsed);

  // 5. Format for LLM
  const sampleData = formatData(sampleUsed);

  // 6. Call LLM — single call that returns multiple chart configs
  const charts = await generateDashboardEmbeddings({
    prompt: input.prompt,
    sampleData,
    config,
    schema,
    charts: input.charts,
    maxCharts: input.maxCharts,
  });

  // 7. Post-LLM validation on each chart item
  const validatedCharts: DashboardChartItem[] = charts.map((item) => {
    const validated = validateEmbeddingConsistency({
      response_type: "graphical",
      meta: item.meta,
      chart: { chart_type: item.chart_type, embedding: item.embedding },
    });
    return {
      chart_type: validated.chart.chart_type,
      embedding: validated.chart.embedding,
      meta: validated.meta,
    };
  });

  return {
    result: {
      response_type: "dashboard",
      charts: validatedCharts,
    },
    sampleUsed,
  };
}
