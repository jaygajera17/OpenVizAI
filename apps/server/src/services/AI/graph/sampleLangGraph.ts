import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { responseFormatterNode } from "../agents/responseFormatter";
import { chartIdentifierNode } from "../agents/chartIdentifier";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { BaseMessage } from "@langchain/core/messages";

export const createSampleLangGraph = async (
  checkPointer: PostgresSaver,
  sessionId: string,
  userId: string,
  userPrompt: string,
  data: any,
) => {
  const StateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: (_, y) => y,
    }),
    sessionId: Annotation<string>({
      value: (x, y) => y,
      default: () => sessionId,
    }),
    userId: Annotation<string>({
      value: (x, y) => y,
      default: () => userId,
    }),
    data: Annotation<any>(),
    userPrompt: Annotation<string>({
      value: (x, y) => y,
      default: () => userPrompt,
    }),
    chartType: Annotation<string>(),
    chartReason: Annotation<string>(),
    result: Annotation<string>(),
    chartIdentifierAgent: Annotation<BaseMessage[]>({
      reducer: (x, y) => x.concat(y),
    }),
    responseFormatterAgent: Annotation<BaseMessage[]>({
      reducer: (x, y) => x.concat(y),
    }),
  });

  const workflow = new StateGraph(StateAnnotation)
    .addNode("chartIdentifier", chartIdentifierNode)
    .addNode("responseFormatter", responseFormatterNode)
    .addEdge(START, "chartIdentifier")
    .addEdge("chartIdentifier", "responseFormatter")
    .addEdge("responseFormatter", END);

  const graph = workflow.compile({
    checkpointer: checkPointer,
  });

  return graph;
};
