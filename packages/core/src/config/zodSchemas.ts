import { z } from "zod";
import { SUPPORTED_CHART_TYPES } from "@openvizai/shared-types";
import {
  EmbeddingFieldSchema,
  EmbeddingFieldTypeSchema,
  EmbeddingSchema,
} from "../types/embedding";

export { EmbeddingFieldSchema, EmbeddingFieldTypeSchema, EmbeddingSchema };

export const responseFormatterSchema = z.object({
  response_type: z.literal("graphical"),
  meta: z.object({
    title: z.string(),
    subtitle: z.string().nullable(),
    query_explanation: z.string(),
  }),
  chart: z.object({
    chart_type: z.enum(SUPPORTED_CHART_TYPES),
    embedding: EmbeddingSchema,
  }),
});
