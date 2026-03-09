import type { ChartType } from "@openvizai/shared-types";

export type Session = {
  session_id: string;
  user_id: string;
  title: string;
  created_ts: string;
  updated_ts: string;
};

type Meta = {
  title: string;
  subtitle: string;
};

interface ChartEmbedding {
  x: Array<{
    field: string;
    label: string;
    unit: string;
  }>;
  y: Array<{
    field: string;
    label: string;
    unit: string;
    type: string;
  }>;
  group: null | unknown;
  category: null | unknown;
  value: null | unknown;
  source: null | unknown;
  target: null | unknown;
  start: null | unknown;
  end: null | unknown;
  series: null | unknown;
  path: null | unknown;
  is_stacked: boolean;
  is_horizontal: boolean;
  isSemanticColors: boolean;
  colorSemantic: null | unknown;
}

export type Message = {
  type: "human" | "ai";
  content: string;
  additional_kwargs: {
    data: string;
  };
  response_metadata: {
    meta: Meta;
    chart: {
      chart_type: ChartType;
      embedding: ChartEmbedding;
    };
    response_type: string;
  };
};

export type MessageResponse = {
  id: string;
  message: Message;
};

export type SessionMessageResponse = {
  session: Session;
  messages: MessageResponse[];
};
