import type { ChartType } from "@openvizai/shared-types";
import type { ChartEmbedding } from "./embedding";

export { ChartType };

export interface ChartMeta {
  title: string;
  subtitle: string | null;
  query_explanation: string;
}

export interface ChartResult {
  response_type: "graphical";
  meta: ChartMeta;
  chart: {
    chart_type: ChartType;
    embedding: ChartEmbedding;
  };
}
