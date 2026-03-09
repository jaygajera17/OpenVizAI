import { createContext, useContext, useState, type ReactNode } from "react";

type ChartState = {
  rows: Record<string, unknown>[];
  setRows: (rows: Record<string, unknown>[]) => void;

  prompt: string;
  setPrompt: (p: string) => void;

  dataInput: string;
  setDataInput: (d: string) => void;

  chartResult: any;
  setChartResult: (r: any) => void;

}

const ChartContext = createContext<ChartState | null>(null);

export function ChartProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<any[]>([]);
  const [prompt, setPrompt] = useState("");
  const [dataInput, setDataInput] = useState("");
  const [chartResult, setChartResult] = useState(null);

  return (
    <ChartContext.Provider
      value={{
        rows,
        setRows,
        prompt,
        setPrompt,
        dataInput,
        setDataInput,
        chartResult,
        setChartResult,
      }}
    >
      {children}
    </ChartContext.Provider>
  );
}

export function useChartState() {
  const ctx = useContext(ChartContext);

  if (!ctx) {
    throw new Error("useChartState must be used inside ChartProvider");
  }

  return ctx;
}