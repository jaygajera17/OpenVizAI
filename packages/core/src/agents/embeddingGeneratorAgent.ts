import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, type BaseMessage } from "@langchain/core/messages";
import { responseFormatterPrompt } from "../prompts/responseFormatterPrompt";
import { responseFormatterSchema } from "../config/zodSchemas";
import { LLMError } from "../errors/index";
import type { ResolvedConfig } from "../config/defaults";
import type { ChartResult } from "../types/chart";

export interface GenerateEmbeddingOptions {
  prompt: string;
  sampleData: { columns: string[]; rows: string[][] };
  config: ResolvedConfig;
  chatHistory?: BaseMessage[];
}

/**
 * Call the LLM with structured output to generate chart embedding metadata.
 * Uses plain ChatOpenAI — no LangGraph, no DB, no sessions.
 */
export async function generateEmbedding(
  options: GenerateEmbeddingOptions,
): Promise<ChartResult> {
  const { prompt, sampleData, config, chatHistory } = options;

  try {
    const model = new ChatOpenAI({
      apiKey: config.apiKey,
      model: config.model,
      maxRetries: config.maxRetries,
      ...(config.baseURL ? { configuration: { baseURL: config.baseURL } } : {}),
    });

    const systemMessage = new SystemMessage(
      responseFormatterPrompt(prompt, sampleData),
    );

    const messages: BaseMessage[] = [systemMessage, ...(chatHistory ?? [])];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- LangChain's withStructuredOutput Zod generics exceed TS depth limit
    const structuredModel = (model as any).withStructuredOutput(
      responseFormatterSchema,
    );
    const response = await structuredModel.invoke(messages);

    return response as ChartResult;
  } catch (err) {
    if (err instanceof LLMError) throw err;
    throw new LLMError(
      `Failed to generate chart embedding: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
