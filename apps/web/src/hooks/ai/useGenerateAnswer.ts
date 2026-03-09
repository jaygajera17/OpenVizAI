import { useMutation } from "@tanstack/react-query";
import { APIService } from "../../services/apiService";

export interface GenerateAnswerRequest {
  prompt: string;
  data: Record<string, unknown>;
  sessionId: string;
}

export interface ChartEmbedding {
  x: Array<{
    field: string;
    label: string;
    unit: string;
  }>;
  y: Array<{
    field: string;
    label: string;
    unit: string;
    type: string;
  }>;
  group: null | unknown;
  category: null | unknown;
  value: null | unknown;
  source: null | unknown;
  target: null | unknown;
  start: null | unknown;
  end: null | unknown;
  series: null | unknown;
  path: null | unknown;
  is_stacked: boolean;
  is_horizontal: boolean;
  isSemanticColors: boolean;
  colorSemantic: null | unknown;
}

export interface GenerateAnswerResponse {
  result: {
    response_type: string;
    meta: {
      title: string;
      subtitle: string;
      query_explanation: string;
    };
    chart: {
      chart_type: string;
      embedding: ChartEmbedding;
    };
  };
  rows: any[];
}

export const useGenerateAnswer = () => {
  return useMutation<GenerateAnswerResponse, Error, GenerateAnswerRequest>({
    mutationFn: (payload: GenerateAnswerRequest) =>
      APIService.post<GenerateAnswerResponse>("/api/ai", payload),
  });
};
