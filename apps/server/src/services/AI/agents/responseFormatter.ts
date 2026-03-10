import { analyzeChart } from "@openvizai/core";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { OPENAI_API_KEY } from "@config/secrets";
import pgPool from "@config/pgPool";
import ChatHistoryService from "@services/chatHistory.service";
import customErrorHandler from "@utils/customErrorHandler";
import SessionService from "@services/session.service";

export const responseFormatterNode = async (state: any) => {
  try {
    const userPrompt = state.userPrompt as string;
    const data = state.data;
    const sessionId = state.sessionId as string;
    const userId = state.userId as string;

    await SessionService.ensureSessionExists(sessionId, userId, userPrompt);

    const userMessage = new HumanMessage({
      content: userPrompt,
      additional_kwargs: {
        data,
      },
    });

    await ChatHistoryService.addChatHistory(sessionId, userMessage, pgPool);
    const previousChatHistory = await ChatHistoryService.getPreviousMessages(
      sessionId,
      pgPool,
    );

    // Delegate to @openvizai/core
    const { result } = await analyzeChart({
      prompt: userPrompt,
      data: Array.isArray(data) ? data : [],
      config: {
        apiKey: OPENAI_API_KEY,
      },
      chatHistory: previousChatHistory,
    });

    const aiMessage = new AIMessage({
      response_metadata: result as unknown as Record<string, unknown>,
    });

    await ChatHistoryService.addChatHistory(sessionId, aiMessage, pgPool);

    const messages = [...previousChatHistory, userMessage];

    return {
      ...state,
      messages,
      result,
      responseFormatterAgent: [userMessage, aiMessage],
    };
  } catch (err) {
    console.error("Error in responseFormatterNode:", err);
    throw new customErrorHandler(400, `${err}`);
  }
};
