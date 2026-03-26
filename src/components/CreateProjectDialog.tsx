import { useState } from "react";
import { Environment, Project } from '../types';
import { Select } from './Select';

interface CreateProjectDialogProps {
  projects: Project[];
  environments: Environment[];
  onClose: () => void;
  onConfirm: (name: string, envId: string, autoLaunch?: boolean) => Promise<void>;
  onCreateEnvironment?: () => void;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  projects,
  environments,
  onClose,
  onConfirm,
  onCreateEnvironment,
}) => {
  const [name, setName] = useState('');
  const [selectedEnv, setSelectedEnv] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, shouldAutoLaunch = false) => {
    e.preventDefault();

    if (isSubmitting) return;

    setError('');

    if (!name.trim()) {
      setError('请输入项目名称');
      return;
    }

    if (!selectedEnv) {
      setError('请选择环境');
      return;
    }

    const nameExists = projects.some((proj) =>
      proj.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (nameExists) {
      setError('项目名称已存在');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(name.trim(), selectedEnv, shouldAutoLaunch);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl w-[90%] max-w-lg max-h-[90vh] overflow-y-auto border border-[var(--color-border)]" onClick={(e) => e.stopPropagation()}>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入项目名称..."
              autoFocus
              className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-all focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="environment" className="block mb-2 font-medium text-[var(--color-text-primary)]">绑定环境</label>
            <Select
              value={selectedEnv}
              onChange={setSelectedEnv}
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
                onClick={() => onCreateEnvironment?.()}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                创建新环境
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-[var(--color-error-muted)] text-[var(--color-error)] px-4 py-3 rounded-lg border border-[var(--color-error)]/20 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
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
              type="submit"
              disabled={isSubmitting}
              className={`${
                isSubmitting
                  ? 'bg-[var(--color-accent-primary)]/50 cursor-not-allowed'
                  : 'bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] cursor-pointer shadow-md shadow-[var(--color-accent-glow)] hover:shadow-lg'
              } text-white border-none px-6 py-2.5 text-base rounded-lg transition-all flex items-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  创建中...
                </>
              ) : (
                '创建'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectDialog;
