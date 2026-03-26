import { useState } from "react";
import { Environment } from '../types';

interface CreateProjectDialogProps {
  environments: Environment[];
  onClose: () => void;
  onConfirm: (name: string, envId: string) => void;
  onCreateEnvironment?: () => void;
}

interface CreateProjectDialogState {
  name: string;
  selectedEnv: string;
  error: string;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  environments,
  onClose,
  onConfirm,
  onCreateEnvironment,
}) => {
  const [state, setState] = useState<CreateProjectDialogState>({
    name: '',
    selectedEnv: '',
    error: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    state.error = '';

    if (!state.name.trim()) {
      state.error = '请输入项目名称';
      setState({ ...state });
      return;
    }

    if (!state.selectedEnv) {
      state.error = '请选择环境';
      setState({ ...state });
      return;
    }

    const nameExists = environments.some(env =>
      env.name.toLowerCase() === state.name.trim().toLowerCase()
    );

    if (nameExists) {
      state.error = '项目名称已存在';
      setState({ ...state });
      return;
    }

    onConfirm(state.name.trim(), state.selectedEnv);
  };

  const handleNewEnvClick = () => {
    if (onCreateEnvironment) {
      onCreateEnvironment();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800 m-0">创建新项目</h3>
          <button
            className="bg-none border-none text-2xl text-slate-400 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="project-name" className="block mb-2 font-medium text-slate-800">项目名称</label>
            <input
              type="text"
              id="project-name"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              placeholder="输入项目名称..."
              autoFocus
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="environment" className="block mb-2 font-medium text-slate-800">绑定环境</label>
            <select
              id="environment"
              value={state.selectedEnv}
              onChange={(e) => setState({ ...state, selectedEnv: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500"
            >
              <option value="">请选择环境</option>
              {environments.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.name} (Python {env.python_version})
                </option>
              ))}
            </select>
            <div className="mt-2">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 bg-none border-none cursor-pointer underline"
                onClick={handleNewEnvClick}
              >
                创建新环境
              </button>
            </div>
          </div>

          {state.error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 mb-4">
              {state.error}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="bg-slate-100 text-slate-800 border-none px-6 py-2.5 text-base rounded-lg cursor-pointer transition-colors hover:bg-slate-200"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-2.5 text-base rounded-lg cursor-pointer transition-colors"
            >
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectDialog;
