import React, { useState, useEffect } from "react";
import { AppConfig, PythonDownloadStrategy } from "../../types";

interface SourceSettingsProps {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
}

// PyPI mirror presets
const PYPI_MIRRORS = [
  { value: "https://pypi.tuna.tsinghua.edu.cn/simple", label: "清华源" },
  { value: "https://pypi.org/simple", label: "官方源" },
  { value: "https://mirrors.aliyun.com/pypi/simple/", label: "阿里源" },
  { value: "custom", label: "自定义" },
];

// Python install mirror presets
const PYTHON_MIRRORS = [
  { value: "https://uv.agentsmirror.com/python-build-standalone/releases/download", label: "agentsmirror" },
  { value: "https://cnb.cool/astral-sh/python-build-standalone/-/releases/download/", label: "腾讯源" },
  { value: "custom", label: "自定义" },
];

// Download strategy options
const DOWNLOAD_STRATEGIES: { value: PythonDownloadStrategy; label: string }[] = [
  { value: "automatic", label: "自动下载" },
  { value: "manual", label: "手动安装" },
  { value: "never", label: "禁止下载" },
];

const SourceSettings: React.FC<SourceSettingsProps> = ({ config, onChange }) => {
  const [customPypiUrl, setCustomPypiUrl] = useState("");
  const [customPythonUrl, setCustomPythonUrl] = useState("");

  // Initialize custom URLs
  useEffect(() => {
    if (!PYPI_MIRRORS.find((m) => m.value === config.sources.pypi_mirror)) {
      setCustomPypiUrl(config.sources.pypi_mirror);
    }
    if (
      config.sources.python_install_mirror &&
      !PYTHON_MIRRORS.find((m) => m.value === config.sources.python_install_mirror)
    ) {
      setCustomPythonUrl(config.sources.python_install_mirror);
    }
  }, [config.sources]);

  const handlePypiMirrorChange = (value: string) => {
    if (value === "custom") {
      onChange({
        sources: { ...config.sources, pypi_mirror: customPypiUrl || "https://pypi.org/simple" },
      });
    } else {
      onChange({
        sources: { ...config.sources, pypi_mirror: value },
      });
    }
  };

  const handleCustomPypiUrlChange = (url: string) => {
    setCustomPypiUrl(url);
    if (url) {
      onChange({
        sources: { ...config.sources, pypi_mirror: url },
      });
    }
  };

  const handlePythonMirrorChange = (value: string) => {
    if (value === "custom") {
      onChange({
        sources: { ...config.sources, python_install_mirror: customPythonUrl },
      });
    } else {
      onChange({
        sources: { ...config.sources, python_install_mirror: value },
      });
    }
  };

  const handleCustomPythonUrlChange = (url: string) => {
    setCustomPythonUrl(url);
    onChange({
      sources: { ...config.sources, python_install_mirror: url },
    });
  };

  const handleDownloadStrategyChange = (strategy: PythonDownloadStrategy) => {
    onChange({
      python: { ...config.python, download_strategy: strategy },
    });
  };

  const currentPypiPreset =
    PYPI_MIRRORS.find((m) => m.value === config.sources.pypi_mirror)?.value || "custom";
  const currentPythonPreset =
    PYTHON_MIRRORS.find((m) => m.value === config.sources.python_install_mirror)?.value ||
    (config.sources.python_install_mirror ? "custom" : undefined);

  return (
    <div className="space-y-6">
      {/* PyPI Mirror Section */}
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-4">PyPI 镜像源</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              选择 PyPI 镜像源
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={currentPypiPreset}
              onChange={(e) => handlePypiMirrorChange(e.target.value)}
            >
              {PYPI_MIRRORS.map((mirror) => (
                <option key={mirror.value} value={mirror.value}>
                  {mirror.label} ({mirror.value})
                </option>
              ))}
            </select>
          </div>

          {currentPypiPreset === "custom" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                自定义 PyPI 镜像 URL
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://pypi.example.com/simple"
                value={customPypiUrl}
                onChange={(e) => handleCustomPypiUrlChange(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">
                请输入完整的 PyPI simple index URL
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Python Install Mirror Section */}
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-4">Python 安装源</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              选择 Python 安装源
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={currentPythonPreset || ""}
              onChange={(e) => handlePythonMirrorChange(e.target.value)}
            >
              <option value="">使用官方源</option>
              {PYTHON_MIRRORS.map((mirror) => (
                <option key={mirror.value} value={mirror.value}>
                  {mirror.label} ({mirror.value})
                </option>
              ))}
            </select>
          </div>

          {currentPythonPreset === "custom" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                自定义 Python 安装源 URL
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder=""
                value={customPythonUrl}
                onChange={(e) => handleCustomPythonUrlChange(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">
                请输入 Python 发行版的下载地址
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Download Strategy Section */}
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-4">Python 下载策略</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            当创建新环境时
          </label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={config.python.download_strategy}
            onChange={(e) => handleDownloadStrategyChange(e.target.value as PythonDownloadStrategy)}
          >
            {DOWNLOAD_STRATEGIES.map((strategy) => (
              <option key={strategy.value} value={strategy.value}>
                {strategy.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-slate-600">
            {config.python.download_strategy === "automatic" &&
              "自动下载并安装指定版本的 Python"}
            {config.python.download_strategy === "manual" &&
              "提示用户手动安装 Python"}
            {config.python.download_strategy === "never" &&
              "禁止下载 Python，仅使用已安装的版本"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SourceSettings;
