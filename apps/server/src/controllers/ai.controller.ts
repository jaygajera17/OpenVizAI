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
import { IAuthUser } from "@interfaces/user";

// extend request to include authenticated user
interface AuthRequest extends Request {
  user?: IAuthUser;
}

class AIController {
  /**
   * 
   * API response:
   * {
    "statusCode": 200,
    "message": "embedding generated",
    "data": {
        "result": {
            "response_type": "graphical",
            "meta": {
                "title": "Temperature and Rainfall Over Days",
                "subtitle": "",
                "query_explanation": "The data shows temperature and rainfall readings for different days of the week."
            },
            "chart": {
                "chart_type": "bar",
                "embedding": {
                    "x": [
                        {
                            "field": "day",
                            "label": "Day",
                            "unit": ""
                        }
                    ],
                    "y": [
                        {
                            "field": "temperature",
                            "label": "Temperature",
                            "unit": "°C",
                            "type": "bar"
                        },
                        {
                            "field": "rainfall",
                            "label": "Rainfall",
                            "unit": "mm",
                            "type": "bar"
                        }
                    ],
                    "group": null,
                    "category": null,
                    "value": null,
                    "source": null,
                    "target": null,
                    "start": null,
                    "end": null,
                    "series": null,
                    "path": null,
                    "is_stacked": false,
                    "is_horizontal": false,
                    "isSemanticColors": false,
                    "colorSemantic": null
                }
            }
        }
    }
}
   */

  public async generateAnswer(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { prompt, data, sessionId } = req.body;
      const userId = req.user.id;

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
      const result = await graph.invoke(
        {
          userPrompt: prompt,
          data: data,
        },
        {
          configurable: { thread_id: sessionId },
        },
      );

      return successResponse(res, HTTP_STATUS_CODE.OK, "embedding generated", {
        result: result.result,
        rows: data,
      });
    } catch (error) {
      next(error);
    }
  }
  /**
 * 
 * API response:
 * 
 * {
    "statusCode": 200,
    "message": "Success",
    "data": {
        "session": {
            "session_id": "b151ae6f-86bc-41a5-ba6d-2885d5325679",
            "user_id": "b503c9d3-a78f-48c4-beed-4de1c77ea13b",
            "title": "new session",
            "created_ts": "2026-02-28T06:31:20.089Z",
            "updated_ts": "2026-02-28T06:31:20.089Z"
        },
        "messages": [
            {
                "id": 1,
                "message": {
                    "type": "human",
                    "content": "Plot a suitable chart for this data",
                    "additional_kwargs": {},
                    "response_metadata": {}
                }
            },
            {
                "id": 2,
                "message": {
                    "type": "ai",
                    "tool_calls": [],
                    "additional_kwargs": {},
                    "response_metadata": {
                        "meta": {
                            "title": "Temperature and Rainfall Over Days",
                            "subtitle": "",
                            "query_explanation": "The data shows temperature and rainfall measurements for Monday and Tuesday, suitable for a line chart to display trends over days."
                        },
                        "chart": {
                            "embedding": {
                                "x": [
                                    {
                                        "unit": "",
                                        "field": "day",
                                        "label": "Day"
                                    }
                                ],
                                "y": [
                                    {
                                        "type": "line",
                                        "unit": "°C",
                                        "field": "temperature",
                                        "label": "Temperature"
                                    },
                                    {
                                        "type": "line",
                                        "unit": "mm",
                                        "field": "rainfall",
                                        "label": "Rainfall"
                                    }
                                ],
                                "end": null,
                                "path": null,
                                "group": null,
                                "start": null,
                                "value": null,
                                "series": null,
                                "source": null,
                                "target": null,
                                "category": null,
                                "is_stacked": false,
                                "colorSemantic": null,
                                "is_horizontal": false,
                                "isSemanticColors": false
                            },
                            "chart_type": "line"
                        },
                        "response_type": "graphical"
                    },
                    "invalid_tool_calls": []
                }
            }
         
            }
        ]
    }
}
 */
  public async getSessionMessages(
    req: AuthRequest,
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
