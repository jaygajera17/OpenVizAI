import { getChartComponent } from "./charts/registry";
import type { OpenVizRendererProps } from "./types/renderer";

function ChartError({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "24px",
        textAlign: "center",
        color: "#6b7280",
        border: "1px dashed #d1d5db",
        borderRadius: "8px",
        backgroundColor: "#f9fafb",
      }}
    >
      <p style={{ margin: 0, fontSize: "14px" }}>{message}</p>
    </div>
  );
}

export default function OpenVizRenderer({
  data,
  chartType,
  embedding,
  meta,
  config,
  className,
}: OpenVizRendererProps) {
  const ChartComponent = getChartComponent(chartType);

  if (!ChartComponent) {
    return (
      <div className={className}>
        <ChartError message={`Unsupported chart type: "${chartType}"`} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={className}>
        <ChartError message="No data available to render the chart." />
      </div>
    );
  }

  return (
    <div className={className}>
      <ChartComponent
        data={data}
        chartType={chartType}
        embedding={embedding}
        meta={meta}
        config={config}
      />
    </div>
  );
}
