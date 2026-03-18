import type { ChartType } from "@openvizai/shared-types";
import type { ChartSpec, ChartMeta, OpenVizConfig } from "../types/index.js";

export type ChartComponentProps = {
  data: Record<string, unknown>[];
  chartType: ChartType;
  chartSpec: ChartSpec;
  meta?: ChartMeta;
  config?: OpenVizConfig;
};
