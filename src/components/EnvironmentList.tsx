import { Environment } from "../types";

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
    <div className="flex flex-col gap-2">
      {environments.map((env) => (
        <div
          key={env.id}
          className={`flex justify-between items-center p-4 border rounded-lg bg-white cursor-pointer transition-all hover:border-blue-500 hover:shadow-sm ${currentEnvId === env.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
          onClick={() => onSelectEnvironment(env.id)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-semibold text-slate-800">{env.name}</div>
              {env.is_default && <span className="text-xs px-2 py-0.5 rounded bg-blue-500 text-white">默认</span>}
            </div>
            <div className="text-sm text-slate-500 mb-0.5">Python {env.python_version}</div>
            <div className="text-xs text-slate-400">
              {new Date(env.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="flex gap-2">
            {currentEnvId === env.id && (
              <button
                type="button"
                className="bg-green-500 hover:bg-green-600 text-white border-none px-3 py-1.5 text-sm rounded cursor-pointer transition-colors"
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
                className="bg-red-500 hover:bg-red-600 text-white border-none px-3 py-1.5 text-sm rounded cursor-pointer transition-colors"
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
