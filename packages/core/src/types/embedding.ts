import { z } from "zod";

export const EmbeddingFieldSchema = z.object({
  field: z.string(),
  label: z.string(),
  unit: z.string().nullable(),
});

export const EmbeddingFieldTypeSchema = EmbeddingFieldSchema.extend({
  type: z
    .enum(["bar", "line", "area"])
    .describe(
      "Type of the field - used for mixed charts where different series have different types (bar, line, area)",
    ),
});

export type EmbeddingField = z.infer<typeof EmbeddingFieldSchema>;
export type EmbeddingFieldWithType = z.infer<typeof EmbeddingFieldTypeSchema>;

export const EmbeddingSchema = z.object({
  x: z.array(EmbeddingFieldSchema).nullable(),
  y: z.array(EmbeddingFieldTypeSchema).nullable(),
  group: z.array(EmbeddingFieldSchema).nullable(),
  category: z.array(EmbeddingFieldSchema).nullable(),
  value: z.array(EmbeddingFieldSchema).nullable(),
  source: z.array(EmbeddingFieldSchema).nullable(),
  target: z.array(EmbeddingFieldSchema).nullable(),
  start: z.array(EmbeddingFieldSchema).nullable(),
  end: z.array(EmbeddingFieldSchema).nullable(),
  series: z.array(EmbeddingFieldSchema).nullable(),
  path: z.array(EmbeddingFieldSchema).nullable(),
  is_stacked: z.boolean().describe("Whether the chart is stacked"),
  is_horizontal: z.boolean().describe("Whether the chart is horizontal"),
  isSemanticColors: z
    .boolean()
    .describe(
      "Whether to use semantic colors. If true, colorSemantic field should be provided. If false, default colors will be used.",
    ),
  colorSemantic: z
    .enum([
      "positive",
      "negative",
      "neutral",
      "warning",
      "caution",
      "target",
      "highlight",
      "missing",
      "forecast",
    ])
    .nullable()
    .describe(
      "Color semantic for all series - only used when isSemanticColors is true. Should be null when isSemanticColors is false.",
    ),
});

export type ChartEmbedding = z.infer<typeof EmbeddingSchema>;
