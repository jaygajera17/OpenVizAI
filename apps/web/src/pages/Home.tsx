import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChartRenderer from "../components/ChartRenderer";
import { useCurrentUser } from "../hooks/auth/useCurrentUser";
import { useSessions } from "../hooks/session/useSessions";
import { useGenerateAnswer } from "../hooks/ai/useGenerateAnswer";
import { removeLocalStorageItem } from "../utils/storage";
import { STORAGE_KEYS } from "../constants/storage";
import { generateUUID } from "../utils/uuid";
import type { GenerateAnswerResponse } from "../hooks/ai/useGenerateAnswer";
import "./Home.css";

export default function Home() {
  const { data: user } = useCurrentUser();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const navigate = useNavigate();
  const generateAnswerMutation = useGenerateAnswer();

  const [prompt, setPrompt] = useState("");
  const [dataInput, setDataInput] = useState("");
  const [chartResult, setChartResult] = useState<GenerateAnswerResponse | null>(
    null,
  );
  const [dataError, setDataError] = useState("");

  const handleLogout = () => {
    removeLocalStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
    removeLocalStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
    navigate("/login");
  };

  const handleGenerateChart = async (e: React.FormEvent) => {
    e.preventDefault();
    setDataError("");

    if (!prompt.trim()) {
      setDataError("Prompt is required");
      return;
    }

    if (!dataInput.trim()) {
      setDataError("Data input is required");
      return;
    }

    let parsedData: Record<string, unknown>;
    try {
      parsedData = JSON.parse(dataInput);
    } catch (err) {
      setDataError("Invalid JSON format in data input");
      return;
    }

    const sessionId = generateUUID();

    generateAnswerMutation.mutate(
      {
        prompt,
        data: parsedData,
        sessionId,
      },
      {
        onSuccess: (response) => {
          setChartResult(response);
        },
      },
    );
  };

  return (
    <div className="home-container">
      <header className="navbar navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">OpenVizAI</span>
          {user && (
            <div className="d-flex align-items-center gap-2">
              <span className="text-light">Logged in: {user.email}</span>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="container">
        <div className="row">
          {/* Left sidebar - Sessions */}
          <aside className="col-md-3 mb-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Your Sessions</h5>
              </div>
              <div className="card-body">
                {sessionsLoading && <p className="text-muted">Loading...</p>}
                {!sessionsLoading && sessions && sessions.length === 0 && (
                  <p className="text-muted">No sessions yet</p>
                )}
                {!sessionsLoading && sessions && sessions.length > 0 && (
                  <ul className="list-group list-group-flush">
                    {sessions.map((s) => (
                      <li key={s.session_id} className="list-group-item">
                        <small className="text-muted">{s.title}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </aside>

          {/* Main content - Query Builder */}
          <main className="col-md-9">
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">Generate Chart</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleGenerateChart}>
                  <div className="mb-3">
                    <label htmlFor="prompt" className="form-label">
                      Prompt
                    </label>
                    <textarea
                      id="prompt"
                      className="form-control"
                      rows={3}
                      placeholder="Describe what chart you want (e.g., 'Plot temperature over time')"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="data" className="form-label">
                      Data (JSON)
                    </label>
                    <textarea
                      id="data"
                      className="form-control font-monospace"
                      rows={6}
                      placeholder='{"day": "Monday", "temperature": 25}'
                      value={dataInput}
                      onChange={(e) => setDataInput(e.target.value)}
                    />
                    <small className="text-muted d-block mt-2">
                      Enter valid JSON data
                    </small>
                  </div>

                  {dataError && (
                    <div className="alert alert-danger" role="alert">
                      {dataError}
                    </div>
                  )}

                  {generateAnswerMutation.error && (
                    <div className="alert alert-danger" role="alert">
                      {(generateAnswerMutation.error as Error)?.message ||
                        "Failed to generate chart"}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={
                      (generateAnswerMutation.status as any) === "pending"
                    }
                  >
                    {(generateAnswerMutation.status as any) === "pending"
                      ? "Generating..."
                      : "Generate Chart"}
                  </button>
                </form>
              </div>
            </div>

            {/* Chart Result */}
            {chartResult && (
              <div className="card">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">{chartResult.result.meta.title}</h5>
                  <small className="text-white-50">
                    {chartResult.result.meta.query_explanation}
                  </small>
                </div>
                <div className="card-body">
                  <ChartRenderer
                    variant={
                      {
                        id: "generated",
                        label: chartResult.result.meta.title,
                        result: chartResult.result,
                        rows: chartResult.rows
                      } as any
                    }
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
