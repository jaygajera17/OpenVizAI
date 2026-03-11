import type { ChartType } from "@openvizai/shared-types";

export type Session = {
  session_id: string;
  user_id: string;
  title: string;
  created_ts: string;
  updated_ts: string;
};

export type EmbeddingField = {
  field: string;
  label: string;
  unit: string | null;
};

export type EmbeddingFieldWithType = EmbeddingField & {
  type: "bar" | "line" | "area";
};

export type ChartEmbedding = {
  x: EmbeddingField[] | null;
  y: EmbeddingFieldWithType[] | null;
  group: EmbeddingField[] | null;
  category: EmbeddingField[] | null;
  value: EmbeddingField[] | null;
  source: EmbeddingField[] | null;
  target: EmbeddingField[] | null;
  start: EmbeddingField[] | null;
  end: EmbeddingField[] | null;
  series: EmbeddingField[] | null;
  path: EmbeddingField[] | null;
  is_stacked: boolean;
  is_horizontal: boolean;
  isSemanticColors: boolean;
  colorSemantic:
    | "positive"
    | "negative"
    | "neutral"
    | "warning"
    | "caution"
    | "target"
    | "highlight"
    | "missing"
    | "forecast"
    | null;
};

export type ChartMeta = {
  title: string;
  subtitle: string | null;
  query_explanation: string;
};

export type DashboardChartItem = {
  chart_type: ChartType;
  meta: ChartMeta;
  embedding: ChartEmbedding;
};

export type SingleChartResult = {
  response_type: "graphical";
  meta: ChartMeta;
  chart: {
    chart_type: ChartType;
    embedding: ChartEmbedding;
  };
};

export type DashboardResult = {
  response_type: "dashboard";
  charts: DashboardChartItem[];
};

export type ChartResultData = SingleChartResult | DashboardResult;

export type Message = {
  type: "human" | "ai";
  content: string;
  additional_kwargs: {
    data?: unknown;
  };
  response_metadata: SingleChartResult;
};

export type MessageResponse = {
  id: string;
  message: Message;
};

export type SessionMessageResponse = {
  session: Session;
  messages: MessageResponse[];
};
