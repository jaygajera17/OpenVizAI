import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/auth/useCurrentUser";
import { useSessions } from "../hooks/session/useSessions";
import { useGenerateAnswer } from "../hooks/ai/useGenerateAnswer";
import { removeLocalStorageItem } from "../utils/storage";
import { STORAGE_KEYS } from "../constants/storage";
import "./Home.css";

import SessionSidebar from "../components/Home/SessionSideBar";
import ChartPlayground from "../components/Home/ChartPlayground";
import { useEffect, useState } from "react";
import { useSessionMessages } from "../hooks/session/useSessionMessages";
import { useChartState } from "../context/chartContext";

export default function Home() {
  const { data: user } = useCurrentUser();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { setRows, setPrompt, setDataInput, setChartResult } = useChartState();

  const navigate = useNavigate();
  const generateAnswerMutation = useGenerateAnswer();
  const sessionMessagesMutation = useSessionMessages();
  useEffect(() => {
    if (generateAnswerMutation.data) {
      setChartResult(generateAnswerMutation.data.result);
    }
  }, [generateAnswerMutation.data]);

  const handleSessionClick = (sessionId: string) => {
    sessionMessagesMutation.mutate(sessionId, {
      onSuccess: (response) => {
        const messages = response.messages;

        const human = messages.find((m) => m.message.type === "human");

        const ai = messages.find((m) => m.message.type === "ai");

        if (!human || !ai) return;

        const prompt = human.message.content;
        const dataString = human.message.additional_kwargs?.data ?? "[]";
        console.log(dataString)
        const data = JSON.parse(JSON.stringify(dataString));

        setPrompt(prompt);
        setDataInput(JSON.stringify(data, null, 2));
        setRows(data);

        const chartResult = {
          result: {
            meta: ai.message.response_metadata.meta,
            chart: ai.message.response_metadata.chart,
            response_type: ai.message.response_metadata.response_type,
          },
          rows: data,
        };
        console.log(prompt, data, chartResult);

        setChartResult({
          meta: ai.message.response_metadata.meta,
          chart: ai.message.response_metadata.chart,
          response_type: ai.message.response_metadata.response_type,
        });
      },
    });
  };

  const handleLogout = () => {
    removeLocalStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
    removeLocalStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
    navigate("/login");
  };

  const handleGenerate = ({ prompt, data, sessionId }: any) => {
    generateAnswerMutation.mutate({
      prompt,
      data,
      sessionId,
    });
  };

  return (
    <div className="home-container">
      <header className="navbar navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <span className="navbar-brand">OpenVizAI</span>
          <div className="text-success">{user?.email}</div>
          {user && (
            <button
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      <div className="container-fluid px-4">
        <div className="row g-4">
          <SessionSidebar
            sessions={sessions}
            loading={sessionsLoading}
            onSelectSession={handleSessionClick}
          />

          <ChartPlayground
            onGenerate={handleGenerate}
            loading={generateAnswerMutation.status === "pending"}
            error={(generateAnswerMutation.error as Error)?.message}
          />
        </div>
      </div>
    </div>
  );
}
