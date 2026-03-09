import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { DATABASE_URL, OPENAI_API_KEY } from "@config/secrets";
import { responseFormatter } from "../prompts/responseFormatterPrompt";
import { responseFormatterSchema } from "../config/zodSchema";
import ChatHistoryService from "@services/chatHistory.service";
import customErrorHandler from "@utils/customErrorHandler";
import { Pool } from "pg";
import SessionService from "@services/session.service";

/**
 * This helper function transforms query results into a tabular format suitable
 * for display. All values are converted to strings to avoid type unions in the
 * schema. Null and undefined values are converted to empty strings.
 *
 * Returns: {
 * columns: ['name', 'age', 'active'],
 * rows: [['John', '30', 'true'], ['Jane', '25', 'false']]
 *
 */
export const formatData = (
  queryResult: Record<string, string | number | boolean | null | undefined>[],
) => {
  // Validate input - must be a non-empty array with valid first element
  if (
    !Array.isArray(queryResult) ||
    queryResult.length === 0 ||
    !queryResult[0] ||
    typeof queryResult[0] !== "object"
  ) {
    return { columns: [], rows: [] };
  }

  const columns = Object.keys(queryResult[0]);
  const rows = queryResult.map((row) =>
    columns.map((col) => {
      const value = row[col];
      // Convert all values to strings - null/undefined become empty string
      return value === null || value === undefined ? "" : String(value);
    }),
  );

  return { columns, rows };
};

const prepareSampleData = (data: any) => {
  if (!data) {
    return null;
  }

  const sample = Array.isArray(data) ? data.slice(0, 2) : data;
  return Array.isArray(sample) ? formatData(sample) : sample;
};



export const responseFormatterNode = async (state: any) => {
  try {
    const userPrompt = state.userPrompt as string;
    const data = state.data;
    const sessionId = state.sessionId as string;
    const userId = state.userId as string;

    const pgPool = new Pool({
      connectionString: DATABASE_URL,
    });

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

    const sampleData = prepareSampleData(data);

    const model = new ChatOpenAI({
      apiKey: OPENAI_API_KEY,
      model: "gpt-4.1-nano-2025-04-14",
    });


    const systemMessage = new SystemMessage(
      responseFormatter(userPrompt, sampleData),
    );

    const messages = [...previousChatHistory, userMessage];
    const contextMessages = [systemMessage, ...messages];

    const response = await model.withStructuredOutput(responseFormatterSchema).invoke(contextMessages);
   
    const aiMessage = new AIMessage({
      response_metadata: response,
    });

    await ChatHistoryService.addChatHistory(sessionId, aiMessage, pgPool);

    return {
      ...state,
      messages,
      result: response,
      responseFormatterAgent: [userMessage, aiMessage],
    };
  } catch (err) {
    console.error("Error in responseFormatterNode:", err);
    throw new customErrorHandler(400, `${err}`);
  }
};
