import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { OpenVizRenderer } from "@openvizai/react";
import { useChartState } from "../../context/chartContext";

interface Props {
  onGenerate: (payload: {
    prompt: string;
    data: Record<string, unknown>[];
    sessionId: string;
  }) => void;
  loading: boolean;
  error?: string;
}

export default function ChartPlayground({ onGenerate, loading, error }: Props) {
  // const [prompt, setPrompt] = useState("");
  // const [dataInput, setDataInput] = useState("");
  const [dataError, setDataError] = useState("");

  const {
    rows,
    setRows,
    prompt,
    setPrompt,
    dataInput,
    setDataInput,
    chartResult,
  } = useChartState();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDataError("");

    if (!prompt.trim()) return setDataError("Prompt is required");
    if (!dataInput.trim()) return setDataError("Data input is required");

    try {
      const parsedData = JSON.parse(dataInput);
      setRows(parsedData);

      // Call generate answer AI API
      onGenerate({
        prompt,
        data: parsedData,
        sessionId: uuidv4(),
      });
    } catch {
      setDataError("Invalid JSON format in data input");
    }
  };

  return (
    <main className="col-12 col-md-8 col-lg-9 col-xl-10">
      <div className="card mb-4 home-card composer-card">
        <div className="card-body composer-body">
          <form onSubmit={handleSubmit} className="composer-form">
            <div className="mb-3">
              <label className="form-label composer-label">Prompt</label>
              <textarea
                className="form-control composer-input"
                rows={1}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label composer-label">Data (JSON)</label>
              <textarea
                className="form-control font-monospace composer-input composer-json"
                rows={4}
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
              />
            </div>

            {dataError && (
              <div className="alert alert-danger composer-alert">
                {dataError}
              </div>
            )}

            {error && (
              <div className="alert alert-danger composer-alert">{error}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 fw-semibold generate-btn"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Chart"}
            </button>
          </form>
        </div>
      </div>

      {chartResult && (
        <div className="card home-card result-card">
          <div className="card-header text-white d-flex flex-column result-card-header">
            <h5 className="mb-1">{chartResult.meta.title}</h5>
            <small className="result-subtitle">
              {chartResult.meta.query_explanation}
            </small>
          </div>

          <div className="card-body result-card-body">
            {
              <OpenVizRenderer
                data={rows}
                chartType={chartResult.chart.chart_type}
                embedding={chartResult.chart.embedding}
                meta={chartResult.meta}
              />
            }
          </div>
        </div>
      )}
    </main>
  );
}
