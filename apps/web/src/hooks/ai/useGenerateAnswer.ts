import { useMutation } from "@tanstack/react-query";
import { APIService } from "../../services/apiService";
import type { ChartResultData } from "../../types/chat";

export interface GenerateAnswerRequest {
  prompt: string;
  data: Record<string, unknown>[];
  sessionId: string;
}

export interface GenerateAnswerResponse {
  result: ChartResultData;
  rows: Record<string, unknown>[];
}

export const useGenerateAnswer = () => {
  return useMutation<GenerateAnswerResponse, Error, GenerateAnswerRequest>({
    mutationFn: (payload: GenerateAnswerRequest) =>
      APIService.post<GenerateAnswerResponse>("/api/ai", payload),
  });
};
