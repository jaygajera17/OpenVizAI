import type { FC } from "react";

interface Session {
  session_id: string;
  title: string;
}

interface Props {
  sessions?: Session[];
  loading: boolean;
  onSelectSession: (sessionId: string) => void;

}


const SessionSidebar: FC<Props> = ({
  sessions,
  loading,
  onSelectSession,
}) => {
  return (
    <aside className="col-md-3 mb-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Your Sessions</h5>
        </div>

        <div className="card-body">
          {loading && <p className="text-muted">Loading...</p>}

          {!loading && sessions && sessions.length === 0 && (
            <p className="text-muted">No sessions yet</p>
          )}
          {!loading && sessions && sessions.length > 0 && (
            <ul className="list-group list-group-flush">
              {sessions.map((s) => (
                <li
                  key={s.session_id}
                  className="list-group-item list-group-item-action"
                  onClick={() => onSelectSession(s.session_id)}
                  style={{ cursor: "pointer" }}
                >
                  <small className="text-muted">{s.title}</small>
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