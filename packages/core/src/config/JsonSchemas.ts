import { SUPPORTED_CHART_TYPES } from "@openvizai/shared-types";

// Raw JSON schema — Gemini compatible
const embeddingField = {
  type: "object",
  properties: {
    field: { type: "string" },
    label: { type: "string" },
    unit: { type: "string" },
  },
  required: ["field", "label"],
};

const embeddingFieldWithType = {
  type: "object",
  properties: {
    field: { type: "string" },
    label: { type: "string" },
    unit: { type: "string" },
    type: { type: "string", enum: ["bar", "line", "area"] },
  },
  required: ["field", "label", "type"],
};

export const responseFormatterSchemaRaw = {
  type: "object",
  properties: {
    response_type: { type: "string", enum: ["graphical"] },
    meta: {
      type: "object",
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        query_explanation: { type: "string" },
      },
      required: ["title", "query_explanation"],
    },
    chart: {
      type: "object",
      properties: {
        chart_type: { type: "string", enum: SUPPORTED_CHART_TYPES },
        embedding: {
          type: "object",
          properties: {
            x: { type: "array", items: embeddingField },
            y: { type: "array", items: embeddingFieldWithType },
            group: { type: "array", items: embeddingField },
            category: { type: "array", items: embeddingField },
            value: { type: "array", items: embeddingField },
            source: { type: "array", items: embeddingField },
            target: { type: "array", items: embeddingField },
            start: { type: "array", items: embeddingField },
            end: { type: "array", items: embeddingField },
            series: { type: "array", items: embeddingField },
            path: { type: "array", items: embeddingField },
            is_stacked: { type: "boolean" },
            is_horizontal: { type: "boolean" },
            isSemanticColors: { type: "boolean" },
            colorSemantic: {
              type: "string",
              enum: [
                "positive",
                "negative",
                "neutral",
                "warning",
                "caution",
                "target",
                "highlight",
                "missing",
                "forecast",
              ],
            },
          },
          required: ["is_stacked", "is_horizontal", "isSemanticColors"],
        },
      },
      required: ["chart_type", "embedding"],
    },
  },
  required: ["response_type", "meta", "chart"],
};

export const dashboardResponseSchemaRaw = {
  type: "object",
  properties: {
    charts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          chart_type: { type: "string", enum: SUPPORTED_CHART_TYPES },
          meta: {
            type: "object",
            properties: {
              title: { type: "string" },
              subtitle: { type: "string" },
              query_explanation: { type: "string" },
            },
            required: ["title", "query_explanation"],
          },
          embedding: {
            type: "object",
            properties: {
              x: { type: "array", items: embeddingField },
              y: { type: "array", items: embeddingFieldWithType },
              group: { type: "array", items: embeddingField },
              category: { type: "array", items: embeddingField },
              value: { type: "array", items: embeddingField },
              source: { type: "array", items: embeddingField },
              target: { type: "array", items: embeddingField },
              start: { type: "array", items: embeddingField },
              end: { type: "array", items: embeddingField },
              series: { type: "array", items: embeddingField },
              path: { type: "array", items: embeddingField },
              is_stacked: { type: "boolean" },
              is_horizontal: { type: "boolean" },
              isSemanticColors: { type: "boolean" },
              colorSemantic: {
                type: "string",
                enum: [
                  "positive",
                  "negative",
                  "neutral",
                  "warning",
                  "caution",
                  "target",
                  "highlight",
                  "missing",
                  "forecast",
                ],
              },
            },
            required: ["is_stacked", "is_horizontal", "isSemanticColors"],
          },
        },
        required: ["chart_type", "meta", "embedding"],
      },
    },
  },
  required: ["charts"],
};
