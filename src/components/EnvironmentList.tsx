import { Environment } from "../types";
import "../App.css";

interface EnvironmentListProps {
  environments: Environment[];
  currentEnvId: string | null;
  onSelectEnvironment: (envId: string) => void;
  onStartJupyter: () => void;
  onDeleteEnvironment: (envId: string) => void;
}

export function EnvironmentList({
  environments,
  currentEnvId,
  onSelectEnvironment,
  onStartJupyter,
  onDeleteEnvironment,
}: EnvironmentListProps) {
  return (
    <div className="environment-list">
      {environments.map((env) => (
        <div
          key={env.id}
          className={`environment-item ${currentEnvId === env.id ? "selected" : ""}`}
          onClick={() => onSelectEnvironment(env.id)}
        >
          <div className="environment-info-card">
            <div className="env-name-row">
              <div className="env-name">{env.name}</div>
              {env.is_default && <span className="env-badge default">默认</span>}
            </div>
            <div className="env-meta">Python {env.python_version}</div>
            <div className="env-created">
              {new Date(env.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="env-actions">
            {currentEnvId === env.id && (
              <button
                type="button"
                className="jupyter-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartJupyter();
                }}
              >
                启动 Jupyter
              </button>
            )}

            {!env.is_default && (
              <button
                type="button"
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEnvironment(env.id);
                }}
              >
                删除
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
