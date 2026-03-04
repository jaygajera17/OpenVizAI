import { useState, type FC } from "react";

interface Session {
  session_id: string;
  title: string;
}

interface Props {
  sessions?: Session[];
  loading: boolean;
  onSelectSession: (sessionId: string) => void;
}


const SessionSidebar: FC<Props> = ({ sessions, loading, onSelectSession }) => {
  const [activeSession, setActiveSession] = useState<string | null>(null);

  return (
    <aside className="col-md-3 col-lg-2 mb-4">
  <div className="card shadow-sm h-100">

    <div className="card-header bg-primary text-white fw-semibold">
      <h6 className="mb-0">Your Sessions</h6>
    </div>

    <div className="card-body p-0">

      {loading && (
        <div className="p-3 text-center text-muted small">
          Loading...
        </div>
      )}

      {!loading && sessions && sessions.length === 0 && (
        <div className="p-3 text-center text-muted small">
          No sessions yet
        </div>
      )}

      {!loading && sessions && sessions.length > 0 && (
        <ul
          className="list-group list-group-flush overflow-auto"
          style={{ maxHeight: "400px" }}
        >
          {sessions.map((s) => (
            <li
              key={s.session_id}
              className={`list-group-item list-group-item-action d-flex align-items-center
              ${activeSession === s.session_id ? "active" : ""}`}
              role="button"
              onClick={() => {
                setActiveSession(s.session_id);
                onSelectSession(s.session_id);
              }}
            >
              <small
                className={
                  activeSession === s.session_id
                    ? "text-white text-truncate"
                    : "text-muted text-truncate"
                }
              >
                {s.title}
              </small>
            </li>
          ))}
        </ul>
      )}

    </div>
  </div>
</aside>
  );
};

export default SessionSidebar;
