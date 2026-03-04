import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ChartRenderer from "../../components/ChartRenderer";
import { useChartState } from "../../context/chartContext";

interface Props {
  onGenerate: (payload: {
    prompt: string;
    data: Record<string, unknown>;
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
    setChartResult,
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
    <main className="col-lg-10">
      <div className="card mb-4">
      

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Prompt</label>
              <textarea
                className="form-control"
                rows={1}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Data (JSON)</label>
              <textarea
                className="form-control font-monospace"
                rows={4}
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
              />
            </div>

            {dataError && <div className="alert alert-danger">{dataError}</div>}

            {error && <div className="alert alert-danger">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary w-100 fw-semibold"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Chart"}
            </button>
          </form>
        </div>
      </div>

      {chartResult && (
        <div className="card">
          <div className="card-header bg-info text-white d-flex flex-column">
            <h5 className="mb-1">{chartResult.meta.title}</h5>
            <small className="opacity-75">{chartResult.meta.query_explanation}</small>
          </div>

          <div className="card-body">
            {(
              <ChartRenderer
                variant={
                  {
                    id: uuidv4(),
                    label: chartResult.meta.title,
                    result: chartResult,
                  } as any
                }
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
