import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { DATABASE_URL, OPENAI_API_KEY } from "@config/secrets";
import { chartIdentifierPrompt } from "../prompts/chartIdentifierPrompt";
import { chartIdentifierSchema } from "../config/zodSchema";
import SessionService from "@services/session.service";
import ChatHistoryService from "@services/chatHistory.service";
import { Pool } from "pg";
import { formatData } from "./responseFormatter";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

const prepareSampleData = (data: any) => {
  if (!data) {
    return null;
  }
  const sample = Array.isArray(data) ? data.slice(0, 2) : data;
  return Array.isArray(sample) ? formatData(sample) : sample;
};

export const chartIdentifierNode = async (state: any) => {
  try {
    const { sessionId, userPrompt, userId, chartIdentifierAgent } = state;

    const pgPool = new Pool({
      connectionString: DATABASE_URL,
    });
    const postgresSaver = new PostgresSaver(pgPool);

    await SessionService.ensureSessionExists(sessionId, userId, userPrompt);

    // Create user message
    const userMessage = new HumanMessage(userPrompt);

    // Store user message in chat history
    await ChatHistoryService.addChatHistory(sessionId, userMessage, pgPool);

    // Get previous chat history
    const previousChatHistory = await ChatHistoryService.getPreviousMessages(
      sessionId,
      pgPool,
    );

    // Prepare messages for downstream agents
    const messages = [...previousChatHistory, userMessage];

    const data = state.data;

    const sampleData = prepareSampleData(data);

    const systemMessage = new SystemMessage(
      chartIdentifierPrompt(userPrompt, sampleData),
    );

    const contextMessages = [
      systemMessage,
      ...chartIdentifierAgent,
      userMessage,
    ];

    // const response = await model
    //   .withStructuredOutput(chartIdentifierSchema)
    //   .invoke(contextMessages);

    const model = new ChatOpenAI({
      apiKey: OPENAI_API_KEY,
      model: "gpt-4.1-nano-2025-04-14",
    });

    const response = await model
      .withStructuredOutput(chartIdentifierSchema)
      .invoke(contextMessages) as any;

    const aiMessage = new AIMessage(
      `Based on the user's prompt and the provided data, I've identified the most suitable chart type as '${response.chart_type}'.`,
    );

    return {
      ...state,
      messages: messages,
      chartType: response.chart_type,
      chartReason: response.reason,
      chartIdentifierAgent: [userMessage, aiMessage],
    };
  } catch (err) {
    console.error("Error in chartIdentifierNode:", err);
    throw err;
  }
};
