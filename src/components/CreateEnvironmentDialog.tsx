import { useState, type FormEvent } from "react";

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 m-0">创建新环境</h2>
          <button
            type="button"
            className="bg-none border-none text-2xl text-slate-400 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="name" className="block mb-2 font-medium text-slate-800">环境名称</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：数据分析"
              required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="python-version" className="block mb-2 font-medium text-slate-800">Python 版本</label>
            <select
              id="python-version"
              value={pythonVersion}
              onChange={(e) => setPythonVersion(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500"
            >
              {PYTHON_VERSIONS.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium text-slate-800">默认预装包</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_PACKAGES.map((pkg) => (
                <span key={pkg} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-sm">
                  {pkg}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="custom-packages" className="block mb-2 font-medium text-slate-800">额外预装包（逗号分隔）</label>
            <textarea
              id="custom-packages"
              value={customPackages}
              onChange={(e) => setCustomPackages(e.target.value)}
              placeholder="例如：seaborn, scikit-learn"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base min-h-20 resize-y font-inherit transition-colors focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              className="bg-slate-100 text-slate-800 border-none px-6 py-2.5 text-base rounded-lg cursor-pointer transition-colors hover:bg-slate-200"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white border-none px-8 py-2.5 text-base rounded-lg cursor-pointer transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
