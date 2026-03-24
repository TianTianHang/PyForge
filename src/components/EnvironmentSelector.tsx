import { Environment } from "../types";
import "../App.css";

interface EnvironmentSelectorProps {
  environments: Environment[];
  currentEnvId: string | null;
  onSelectEnvironment: (envId: string) => void;
  onCreateEnvironment: () => void;
  onStartJupyter: () => void;
}

export function EnvironmentSelector({
  environments,
  currentEnvId,
  onSelectEnvironment,
  onCreateEnvironment,
  onStartJupyter,
}: EnvironmentSelectorProps) {
  const currentEnvironment = environments.find(env => env.id === currentEnvId);

  return (
    <div className="welcome-screen">
      <h1>Welcome to PyForge</h1>
      <p>选择您的 Python 开发环境</p>

      <div className="welcome-info">
        {environments.length > 0 ? (
          <>
            <h3>已有环境 ({environments.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {environments.map(env => (
                <div
                  key={env.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: currentEnvId === env.id ? '2px solid #3498db' : '1px solid #e0e0e0',
                    backgroundColor: currentEnvId === env.id ? '#f0f8ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => onSelectEnvironment(env.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{env.name}</strong>
                      {env.is_default && <span style={{ marginLeft: '0.5rem', padding: '0.2rem 0.4rem', backgroundColor: '#3498db', color: 'white', borderRadius: '4px', fontSize: '0.7rem' }}>Default</span>}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      Python {env.python_version}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                    创建于 {new Date(env.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            {currentEnvironment && (
              <div className="primary-button" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={onStartJupyter}>
                打开 JupyterLab ({currentEnvironment.name})
              </div>
            )}
          </>
        ) : (
          <div>
            <h3>还没有任何环境</h3>
            <p>创建一个全新的 Python 开发环境</p>
          </div>
        )}

        <button className="primary-button" onClick={onCreateEnvironment}>
          创建新环境
        </button>
      </div>
    </div>
  );
}