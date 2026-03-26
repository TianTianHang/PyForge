import { useState, useEffect } from "react";
import { Environment, Project, UserMode } from '../types';
import { Select } from './Select';
import TemplateSelector from './TemplateSelector';
import { PROJECT_TEMPLATES } from '../constants/templates';

/**
 * CreateProjectDialog component props
 * @interface CreateProjectDialogProps
 * @property {Project[]} projects - List of existing projects for validation
 * @property {Environment[]} environments - List of available environments
 * @property {() => void} onClose - Callback to close the dialog
 * @property {(name: string, envId: string, autoLaunch?: boolean) => Promise<void>} onConfirm - Callback to create the project
 * @property {() => void} [onCreateEnvironment] - Callback to open environment creation dialog
 * @property {UserMode} userMode - Current user mode for progressive disclosure
 * @property {string | null} [preselectedTemplate] - Template ID to pre-select (from welcome screen)
 */
interface CreateProjectDialogProps {
  projects: Project[];
  environments: Environment[];
  onClose: () => void;
  onConfirm: (name: string, envId: string, autoLaunch?: boolean) => Promise<void>;
  onCreateEnvironment?: () => void;
  userMode: UserMode;
  preselectedTemplate?: string | null;
};

interface CreateProjectDialogState {
  name: string;
  selectedEnv: string;
  selectedTemplate: string;
  error: string;
  isSubmitting: boolean;
  showAdvanced: boolean;
  autoLaunch: boolean;
}

/**
 * CreateProjectDialog - Project creation dialog with template support
 * Supports simplified mode for beginners (template-based) and advanced mode for experienced users
 * Implements progressive disclosure based on userMode
 */
const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  projects,
  environments,
  onClose,
  onConfirm,
  onCreateEnvironment,
  userMode,
  preselectedTemplate,
}) => {
  const [state, setState] = useState<CreateProjectDialogState>({
    name: '',
    selectedEnv: '',
    selectedTemplate: '',
    error: '',
    isSubmitting: false,
    showAdvanced: false,
    autoLaunch: false,
  });

  useEffect(() => {
    if (preselectedTemplate) {
      setState((prev) => ({ ...prev, selectedTemplate: preselectedTemplate, autoLaunch: true }));
    }
  }, [preselectedTemplate]);

  const selectedTemplateData = PROJECT_TEMPLATES.find((t) => t.id === state.selectedTemplate);

  useEffect(() => {
    if (selectedTemplateData && !state.selectedEnv) {
      const defaultEnv = environments.find((env) => env.is_default);
      if (defaultEnv) {
        setState((prev) => ({ ...prev, selectedEnv: defaultEnv.id }));
      }
    }
  }, [selectedTemplateData, state.selectedEnv, environments]);

  const isSimplifiedMode = userMode === 'first-time' || userMode === 'beginner';
  const showHelperText = userMode === 'first-time' || userMode === 'beginner';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, shouldAutoLaunch = false) => {
    e.preventDefault();

    if (state.isSubmitting) {
      return;
    }

    const newState = { ...state, error: '', isSubmitting: true };
    setState(newState);

    if (!state.name.trim()) {
      setState({ ...newState, error: '请输入项目名称', isSubmitting: false });
      return;
    }

    if (!isSimplifiedMode && !state.selectedTemplate && !state.selectedEnv) {
      setState({ ...newState, error: '请选择环境或模板', isSubmitting: false });
      return;
    }

    if (state.selectedTemplate && !state.selectedEnv) {
      setState({ ...newState, error: '请选择环境', isSubmitting: false });
      return;
    }

    const nameExists = projects.some((proj) =>
      proj.name.toLowerCase() === state.name.trim().toLowerCase()
    );

    if (nameExists) {
      setState({ ...newState, error: '项目名称已存在', isSubmitting: false });
      return;
    }

    try {
      await onConfirm(state.name.trim(), state.selectedEnv, shouldAutoLaunch || state.autoLaunch);
    } finally {
      setState({ ...state, isSubmitting: false });
    }
  };

  const handleNewEnvClick = () => {
    if (onCreateEnvironment) {
      onCreateEnvironment();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--color-border)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--color-border)]">
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] m-0">创建新项目</h3>
          <button
            className="bg-none border-none text-2xl text-[var(--color-text-tertiary)] w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-all hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-secondary)]"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6">
          <div className="mb-6">
            <label htmlFor="project-name" className="block mb-2 font-medium text-[var(--color-text-primary)]">项目名称</label>
            <input
              type="text"
              id="project-name"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              placeholder="输入项目名称..."
              autoFocus
              className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-all focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]"
            />
          </div>

          <div className="mb-6">
            <TemplateSelector
              selectedTemplate={state.selectedTemplate}
              onTemplateSelect={(templateId) => setState({ ...state, selectedTemplate: templateId })}
              disabled={state.isSubmitting}
            />
          </div>

          {!state.showAdvanced && showHelperText && (
            <div className="mb-6 p-4 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <svg className="w-4 h-4 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedTemplateData ? (
                  <span>将使用 {selectedTemplateData.name} 模板的默认配置（Python {selectedTemplateData.pythonVersion}）</span>
                ) : (
                  <span>将使用默认环境的配置</span>
                )}
              </div>
            </div>
          )}

          <div className={`mb-6 overflow-hidden transition-all duration-300 ${state.showAdvanced ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="border-t border-[var(--color-border)] pt-6">
              <div className="mb-6">
                <label htmlFor="environment" className="block mb-2 font-medium text-[var(--color-text-primary)]">绑定环境</label>
                <Select
                  value={state.selectedEnv}
                  onChange={(value) => setState({ ...state, selectedEnv: value })}
                  options={[
                    { value: '', label: '请选择环境' },
                    ...environments.map((env) => ({
                      value: env.id,
                      label: `${env.name} (Python ${env.python_version})`
                    }))
                  ]}
                  placeholder="请选择环境"
                />
                <div className="mt-2">
                  <button
                    type="button"
                    className="text-sm text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] bg-none border-none cursor-pointer transition-colors flex items-center gap-1"
                    onClick={handleNewEnvClick}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    创建新环境
                  </button>
                </div>
              </div>
            </div>
          </div>

          {!isSimplifiedMode && (
            <div className="mb-6">
              <button
                type="button"
                className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] bg-none border-none cursor-pointer transition-colors flex items-center gap-1"
                onClick={() => setState({ ...state, showAdvanced: !state.showAdvanced })}
              >
                <svg className={`w-4 h-4 transition-transform ${state.showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {state.showAdvanced ? '隐藏高级设置' : '显示高级设置'}
              </button>
            </div>
          )}

          {state.error && (
            <div className="bg-[var(--color-error-muted)] text-[var(--color-error)] px-4 py-3 rounded-lg border border-[var(--color-error)]/20 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {state.error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] px-6 py-2.5 text-base rounded-lg cursor-pointer transition-all hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-hover)]"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="button"
              disabled={state.isSubmitting}
              className={`${
                state.isSubmitting
                  ? 'bg-[var(--color-text-tertiary)] cursor-not-allowed'
                  : 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] cursor-pointer'
              } text-[var(--color-text-secondary)] border border-[var(--color-border)] px-6 py-2.5 text-base rounded-lg transition-all flex items-center gap-2`}
              onClick={() => {
                const syntheticEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>;
                handleSubmit(syntheticEvent, false);
              }}
            >
              {state.isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--color-text-tertiary)] border-t-[var(--color-text-secondary)] rounded-full animate-spin"></div>
                  创建中...
                </>
              ) : (
                '创建'
              )}
            </button>
            {(isSimplifiedMode || state.selectedTemplate) && (
              <button
                type="submit"
                disabled={state.isSubmitting}
                className={`${
                  state.isSubmitting
                    ? 'bg-[var(--color-text-tertiary)] cursor-not-allowed'
                    : 'bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] cursor-pointer shadow-md shadow-[var(--color-accent-glow)] hover:shadow-lg'
                } text-white border-none px-6 py-2.5 text-base rounded-lg transition-all flex items-center gap-2`}
              >
                {state.isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    启动中...
                  </>
                ) : (
                  <>
                    创建并开始
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectDialog;
