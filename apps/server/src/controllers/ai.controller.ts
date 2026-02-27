import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS_CODE, successResponse } from "@utils/index";
import { createSampleLangGraph } from "@services/AI/graph/sampleLangGraph";
import SessionService from "../services/session.service";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import ChatHistoryService from "@services/chatHistory.service";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { DATABASE_URL } from "@config/secrets";
import { Pool } from "pg";
import logger from "@logger/index";

class AIController {
  public async generateAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt, data, sessionId, userPrompt } = req.body;
      const userId = req.user?.id;

      const pgPool = new Pool({
        connectionString: DATABASE_URL,
      });
      const postgresSaver = new PostgresSaver(pgPool);

      const graph = await createSampleLangGraph(
        postgresSaver,
        sessionId,
        userId,
        prompt,
        data,
      );
      const result = await graph.invoke({
        userPrompt: prompt,
        data: data,
      });

      return successResponse(res, HTTP_STATUS_CODE.OK, "embedding generated", {
        result: result.result,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getSessionMessages(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { sessionId } = req.params;
      const session = await SessionService.getSessionById(sessionId);
      const chatHistory =
        await ChatHistoryService.getChatHistoryBySessionId(sessionId);
      return successResponse(res, HTTP_STATUS_CODE.OK, "Success", {
        session: session,
        messages: chatHistory,
      });
    } catch (error) {
      logger.error("Error in getChatHistory", error);
      next(error);
    }
  }
}

export default new AIController();
