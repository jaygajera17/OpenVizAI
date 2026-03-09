import type { ComponentType } from "react";
import type { ChartComponentProps } from "./types";

import LineChart from "./LineChart";
import BarChart from "./BarChart";
import PieChart from "./PieChart";
import RadarChart from "./RadarChart";

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

/** Register a custom chart component for a chart type */
export function registerChart(
  chartType: string,
  component: ComponentType<ChartComponentProps>,
): void {
  registry[chartType] = component;
}

/** Get the component for a chart type. Returns undefined if not registered. */
export function getChartComponent(
  chartType: string,
): ComponentType<ChartComponentProps> | undefined {
  return registry[chartType];
}

/** Reset registry to defaults (useful for testing) */
export function resetChartRegistry(): void {
  registry = { ...defaultRegistry };
}
