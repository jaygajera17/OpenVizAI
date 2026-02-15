import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { myLLMNode } from "../agents/myLLMNode";

export const createSampleLangGraph = async (
  userPrompt:string,
  data:any
) => {
  const StateAnnotation = Annotation.Root({
    data: Annotation<any>(),
    userPrompt: Annotation<string>(),
    result: Annotation<string>(),
  });

  const graph = new StateGraph(StateAnnotation)
    .addNode("responseFormatter", myLLMNode)
    .addEdge(START, "responseFormatter")
    .addEdge("responseFormatter", END)
    .compile();

  return graph;
};
