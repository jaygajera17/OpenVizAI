export type PieChartEmbedding = {
  // Field name in rows that contains the category/label
  category: string;
  // Field name in rows that contains the numeric value
  value: string;
  // Whether to render as donut instead of pie
  is_donut?: boolean;
};

export type PieGraphicalMeta = {
  title: string;
  subtitle: string | null;
  query_explanation: string | null;
};

export type PieGraphicalChart = {
  chart_type: "pie" | "donut";
  embedding: PieChartEmbedding;
};

export type PieGraphicalResult = {
  response_type: "graphical";
  meta: PieGraphicalMeta;
  chart: PieGraphicalChart;
};

export type PieChartVariant = {
  id: string;
  label: string;
  result: PieGraphicalResult;
  rows: Record<string, string | number>[];
};

// Variant 1: Simple market share pie
export const productSharePieVariant: PieChartVariant = {
  id: "product-share-pie",
  label: "Product Market Share (Pie)",
  result: {
    response_type: "graphical",
    meta: {
      title: "Product Market Share",
      subtitle: "Share of revenue by product line",
      query_explanation:
        "Pie chart showing percentage share of revenue for each product line.",
    },
    chart: {
      chart_type: "pie",
      embedding: {
        category: "product",
        value: "revenue",
      },
    },
  },
  rows: [
    { product: "Alpha", revenue: 42000 },
    { product: "Beta", revenue: 28000 },
    { product: "Gamma", revenue: 18000 },
    { product: "Delta", revenue: 12000 },
  ],
};

// Variant 2: Donut chart of ticket status distribution
export const ticketStatusDonutVariant: PieChartVariant = {
  id: "ticket-status-donut",
  label: "Ticket Status Distribution (Donut)",
  result: {
    response_type: "graphical",
    meta: {
      title: "Ticket Status Distribution",
      subtitle: "Open vs In Progress vs Resolved",
      query_explanation:
        "Donut chart showing distribution of support tickets by current status.",
    },
    chart: {
      chart_type: "donut",
      embedding: {
        category: "status",
        value: "count",
        is_donut: true,
      },
    },
  },
  rows: [
    { status: "Open", count: 45 },
    { status: "In Progress", count: 30 },
    { status: "Resolved", count: 90 },
    { status: "Closed", count: 35 },
  ],
};

export const allPieChartVariants: PieChartVariant[] = [
  productSharePieVariant,
  ticketStatusDonutVariant,
];

