import type { ChartType } from "@openvizai/shared-types";
import type { ChartEmbedding, ChartMeta, OpenVizConfig } from "../types";

export type ChartComponentProps = {
  data: Record<string, unknown>[];
  chartType: ChartType;
  embedding: ChartEmbedding;
  meta?: ChartMeta;
  config?: OpenVizConfig;
};
