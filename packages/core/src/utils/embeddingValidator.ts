import type { ChartResult } from "../types/chart";
import type { ChartEmbedding } from "../types/embedding";

/**
 * Post-LLM validation: ensure chart_type matches the filled embedding fields.
 * If inconsistent, attempt to fix by nullifying wrong fields and filling correct ones.
 * Returns the (possibly corrected) ChartResult.
 */
export function validateEmbeddingConsistency(result: ChartResult): ChartResult {
  const { chart_type } = result.chart;
  const embedding = { ...result.chart.embedding };

  if (chart_type === "pie" || chart_type === "donut") {
    // Pie/donut needs category + value, NOT x + y
    if (
      (!embedding.category || embedding.category.length === 0) &&
      (!embedding.value || embedding.value.length === 0)
    ) {
      // LLM filled x/y instead of category/value — attempt recovery
      if (
        embedding.x &&
        embedding.x.length > 0 &&
        embedding.y &&
        embedding.y.length > 0
      ) {
        embedding.category = [
          {
            field: embedding.x[0].field,
            label: embedding.x[0].label,
            unit: embedding.x[0].unit,
          },
        ];
        embedding.value = [
          {
            field: embedding.y[0].field,
            label: embedding.y[0].label,
            unit: embedding.y[0].unit,
          },
        ];
      }
    }
    embedding.x = null;
    embedding.y = null;
  } else if (chart_type === "range_bar") {
    // range_bar needs x, start, end
    // Recovery path: if start/end are missing but y has at least 2 fields,
    // map y[0] -> start and y[1] -> end.
    if (
      (!embedding.start || embedding.start.length === 0) &&
      (!embedding.end || embedding.end.length === 0) &&
      embedding.y &&
      embedding.y.length >= 2
    ) {
      embedding.start = [
        {
          field: embedding.y[0].field,
          label: embedding.y[0].label,
          unit: embedding.y[0].unit,
        },
      ];
      embedding.end = [
        {
          field: embedding.y[1].field,
          label: embedding.y[1].label,
          unit: embedding.y[1].unit,
        },
      ];
    }

    // Recovery path: if x is missing but category exists, reuse category as x.
    if (
      (!embedding.x || embedding.x.length === 0) &&
      embedding.category &&
      embedding.category.length > 0
    ) {
      embedding.x = [
        {
          field: embedding.category[0].field,
          label: embedding.category[0].label,
          unit: embedding.category[0].unit,
        },
      ];
    }

    embedding.is_horizontal = true;
    embedding.y = null;
    embedding.category = null;
    embedding.value = null;
  } else if (
    chart_type === "line" ||
    chart_type === "bar" ||
    chart_type === "radar"
  ) {
    // line/bar/radar needs x + y
    if (
      (!embedding.x || embedding.x.length === 0) &&
      (!embedding.y || embedding.y.length === 0)
    ) {
      // LLM filled category/value instead of x/y — attempt recovery
      if (
        embedding.category &&
        embedding.category.length > 0 &&
        embedding.value &&
        embedding.value.length > 0
      ) {
        embedding.x = [
          {
            field: embedding.category[0].field,
            label: embedding.category[0].label,
            unit: embedding.category[0].unit,
          },
        ];
        embedding.y = [
          {
            field: embedding.value[0].field,
            label: embedding.value[0].label,
            unit: embedding.value[0].unit,
            type: "bar" as const,
          },
        ];
      }
    }
    embedding.category = null;
    embedding.value = null;
    embedding.start = null;
    embedding.end = null;
  }

  return {
    ...result,
    chart: {
      ...result.chart,
      embedding: embedding as ChartEmbedding,
    },
  };
}
