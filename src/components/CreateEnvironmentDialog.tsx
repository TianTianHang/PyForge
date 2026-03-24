import { useState, type FormEvent } from "react";
import "../App.css";

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
    <div className="dialog-overlay">
      <div className="dialog-content">
        <div className="dialog-header">
          <h2>创建新环境</h2>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-group">
            <label htmlFor="name">环境名称</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：数据分析"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="python-version">Python 版本</label>
            <select
              id="python-version"
              value={pythonVersion}
              onChange={(e) => setPythonVersion(e.target.value)}
            >
              {PYTHON_VERSIONS.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>默认预装包</label>
            <div className="package-list-grid">
              {DEFAULT_PACKAGES.map((pkg) => (
                <span key={pkg} className="package-chip">
                  {pkg}
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="custom-packages">额外预装包（逗号分隔）</label>
            <textarea
              id="custom-packages"
              value={customPackages}
              onChange={(e) => setCustomPackages(e.target.value)}
              placeholder="例如：seaborn, scikit-learn"
              className="custom-packages-input"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? "创建中..." : "创建环境"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
