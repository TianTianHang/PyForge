import { useState, type FormEvent } from "react";
import { Select } from "./Select";

interface CreateEnvironmentDialogProps {
  onClose: () => void;
  onCreateEnvironment: (name: string, pythonVersion: string, packages: string[]) => void;
  isLoading: boolean;
}

const PYTHON_VERSIONS = ["3.12", "3.11", "3.10", "3.9"];

const DEFAULT_PACKAGES = [
  "numpy",
  "pandas",
  "matplotlib",
  "ipykernel",
  "jupyterlab",
];

export function CreateEnvironmentDialog({
  onClose,
  onCreateEnvironment,
  isLoading,
}: CreateEnvironmentDialogProps) {
  const [name, setName] = useState("");
  const [pythonVersion, setPythonVersion] = useState(PYTHON_VERSIONS[0]);
  const [customPackages, setCustomPackages] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    const packageList = [...DEFAULT_PACKAGES];

    if (customPackages.trim()) {
      customPackages.split(",").forEach((pkg) => {
        const trimmed = pkg.trim();
        if (trimmed && !packageList.includes(trimmed)) {
          packageList.push(trimmed);
        }
      });
    }

    onCreateEnvironment(name.trim(), pythonVersion, packageList);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl w-[90%] max-w-md max-h-[90vh] overflow-y-auto border border-[var(--color-border)]">
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] m-0">创建新环境</h2>
          <button
            type="button"
            className="bg-none border-none text-2xl text-[var(--color-text-tertiary)] w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-all hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-secondary)]"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="name" className="block mb-2 font-medium text-[var(--color-text-primary)]">环境名称</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：数据分析"
              required
              className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-all focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="python-version" className="block mb-2 font-medium text-[var(--color-text-primary)]">Python 版本</label>
            <Select
              value={pythonVersion}
              onChange={setPythonVersion}
              options={PYTHON_VERSIONS.map((version) => ({
                value: version,
                label: version
              }))}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium text-[var(--color-text-primary)]">默认预装包</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_PACKAGES.map((pkg) => (
                <span key={pkg} className="bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] px-3 py-1.5 rounded-full text-sm border border-[var(--color-accent-primary)]/20">
                  {pkg}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="custom-packages" className="block mb-2 font-medium text-[var(--color-text-primary)]">额外预装包（逗号分隔）</label>
            <textarea
              id="custom-packages"
              value={customPackages}
              onChange={(e) => setCustomPackages(e.target.value)}
              placeholder="例如：seaborn, scikit-learn"
              className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-base min-h-20 resize-y font-inherit text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-all focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]"
            />
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              className="bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] px-6 py-2.5 text-base rounded-lg cursor-pointer transition-all hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-hover)]"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white border-none px-8 py-2.5 text-base rounded-lg cursor-pointer transition-all shadow-md shadow-[var(--color-accent-glow)] hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  创建中...
                </>
              ) : (
                "创建环境"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}