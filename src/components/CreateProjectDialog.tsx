import { useState } from "react";
import { Environment } from '../types';
import './CreateProjectDialog.css';

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

    // Validation
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

    // Check for duplicate names (case-insensitive)
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
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3>创建新项目</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-body">
          <div className="form-group">
            <label htmlFor="project-name">项目名称</label>
            <input
              type="text"
              id="project-name"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              placeholder="输入项目名称..."
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="environment">绑定环境</label>
            <select
              id="environment"
              value={state.selectedEnv}
              onChange={(e) => setState({ ...state, selectedEnv: e.target.value })}
            >
              <option value="">请选择环境</option>
              {environments.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.name} (Python {env.python_version})
                </option>
              ))}
            </select>
            <div className="environment-actions">
              <button
                type="button"
                className="new-env-button"
                onClick={handleNewEnvClick}
              >
                创建新环境
              </button>
            </div>
          </div>

          {state.error && (
            <div className="error-message">
              {state.error}
            </div>
          )}

          <div className="dialog-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="confirm-button">
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectDialog;