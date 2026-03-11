import type { ChartType } from "@openvizai/shared-types";

/** Field mapping from embedding metadata */
export type EmbeddingField = {
  field: string;
  label: string;
  unit?: string | null;
  type?: string | null;
};

/** Full embedding metadata describing how to visualize the data */
export type ChartEmbedding = {
  x?: EmbeddingField[] | null;
  y?: EmbeddingField[] | null;
  group?: EmbeddingField[] | null;
  category?: EmbeddingField[] | null;
  value?: EmbeddingField[] | null;
  source?: EmbeddingField[] | null;
  target?: EmbeddingField[] | null;
  start?: EmbeddingField | EmbeddingField[] | null;
  end?: EmbeddingField | EmbeddingField[] | null;
  series?: EmbeddingField[] | null;
  path?: EmbeddingField[] | null;
  is_stacked?: boolean;
  is_horizontal?: boolean;
  is_range?: boolean;
  is_donut?: boolean;
  isSemanticColors?: boolean;
  colorSemantic?: string | null;
  line_curve?: "smooth" | "straight" | "stepline";
  markers_size?: number;
  forecast_points?: number;
};

/** Chart metadata from the LLM response */
export type ChartMeta = {
  title: string;
  subtitle?: string | null;
  query_explanation?: string | null;
};

/** Optional rendering configuration */
export type OpenVizConfig = {
  height?: number;
  width?: string | number;
  legendPosition?: "top" | "bottom" | "left" | "right";
  dataLabelsEnabled?: boolean;
  toolbarVisible?: boolean;
  animations?: boolean;
};

/** Props for the main <OpenVizRenderer /> component */
export type OpenVizRendererProps = {
  /** The dataset rows to visualize */
  data: Record<string, unknown>[];
  /** Chart type to render */
  chartType: ChartType;
  /** Embedding metadata describing field mappings */
  embedding: ChartEmbedding;
  /** Optional chart metadata (title, subtitle) */
  meta?: ChartMeta;
  /** Optional rendering config overrides */
  config?: OpenVizConfig;
  /** Optional CSS class name for the wrapper */
  className?: string;
};
