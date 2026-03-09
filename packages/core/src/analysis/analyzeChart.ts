import type { BaseMessage } from "@langchain/core/messages";
import type { AnalyzeChartInput, AnalyzeChartResult } from "../types/api";
import { resolveConfig } from "../config/defaults";
import { sampleDataset } from "./datasetSampler";
import { formatData } from "../utils/formatData";
import { generateEmbedding } from "../agents/embeddingGeneratorAgent";
import { validateInput } from "../utils/validation";

export interface AnalyzeChartOptions extends AnalyzeChartInput {
  /** Optional chat history for multi-turn conversation context */
  chatHistory?: BaseMessage[];
}

/**
 * Main entry point for OpenVizAI core.
 *
 * Takes a user prompt and dataset, returns chart type + embedding metadata.
 * No database, no HTTP, no auth — pure visualization intelligence.
 */
export async function analyzeChart(
  input: AnalyzeChartOptions,
): Promise<AnalyzeChartResult> {
  // 1. Validate input
  validateInput(input);

  // 2. Resolve config (merge user config with defaults)
  const config = resolveConfig(input.config);

  // 3. Sample dataset
  const sampleUsed = sampleDataset(input.data, config.sampleRows);

  // 4. Format sample into tabular structure for LLM
  const sampleData = formatData(sampleUsed);

  // 5. Call LLM to generate chart embedding
  const result = await generateEmbedding({
    prompt: input.prompt,
    sampleData,
    config,
    chatHistory: input.chatHistory,
  });

  // 6. Return result
  return { result, sampleUsed };
}
