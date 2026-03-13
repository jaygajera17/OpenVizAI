import type { ComponentType } from "react";
import type { ChartComponentProps } from "./types.js";

import LineChart from "./LineChart.js";
import BarChart from "./BarChart.js";
import PieChart from "./PieChart.js";
import RadarChart from "./RadarChart.js";

type ChartRegistry = Record<string, ComponentType<ChartComponentProps>>;

const defaultRegistry: ChartRegistry = {
  line: LineChart,
  bar: BarChart,
  range_bar: BarChart,
  pie: PieChart,
  donut: PieChart,
  radar: RadarChart,
};

let registry: ChartRegistry = { ...defaultRegistry };

/**
 * Register a custom chart component for a given chart type.
 *
 * Use this to extend the built-in chart registry with your own
 * chart components (e.g. a custom heatmap or treemap).
 *
 * @param chartType - The chart type key (e.g. `"heatmap"`).
 * @param component - The React component to render for that type.
 *
 * @example
 * ```tsx
 * import { registerChart } from "@openvizai/react";
 * import MyHeatmap from "./MyHeatmap";
 *
 * registerChart("heatmap", MyHeatmap);
 * ```
 */
export function registerChart(
  chartType: string,
  component: ComponentType<ChartComponentProps>,
): void {
  registry[chartType] = component;
}

/**
 * Get the registered React component for a chart type.
 *
 * Returns `undefined` if no component is registered for the given type.
 *
 * @param chartType - The chart type key to look up.
 * @returns The registered component, or `undefined`.
 */
export function getChartComponent(
  chartType: string,
): ComponentType<ChartComponentProps> | undefined {
  return registry[chartType];
}

/**
 * Reset the chart registry to the built-in defaults.
 *
 * Useful in tests to restore the original registry after custom registrations.
 */
export function resetChartRegistry(): void {
  registry = { ...defaultRegistry };
}
