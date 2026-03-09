import { getChartComponent } from "./charts/registry";
import type { OpenVizRendererProps } from "./types/renderer";

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
    return null;
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
