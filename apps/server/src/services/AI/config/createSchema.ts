import { z } from "zod";
import {
  PieEmbeddingSchema,
  XYEmbeddingSchema,
  RangeEmbeddingSchema,
} from "./zodSchema";

export const createResponseFormatterSchema = (chartType: string) => {
  let embeddingSchema;

  if (chartType === "pie" || chartType === "donut") {
    embeddingSchema = PieEmbeddingSchema;
  } else if (chartType === "range_bar") {
    embeddingSchema = RangeEmbeddingSchema;
  } else {
    embeddingSchema = XYEmbeddingSchema; // bar + line
  }

  return z.object({
    response_type: z.literal("graphical"),
    meta: z.object({
      title: z.string(),
      subtitle: z.string().nullable(),
      query_explanation: z.string(),
    }),
    chart: z.object({
      chart_type: z.enum(["line", "bar", "range_bar", "pie", "donut"]),
      embedding: embeddingSchema,
    }),
  });
};
