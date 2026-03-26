import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppConfig, ValidationResult } from "../../types";

interface PathSettingsProps {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
}

const PathSettings: React.FC<PathSettingsProps> = ({ config, onChange }) => {
  const [dataDirInput, setDataDirInput] = useState(config.paths.data_dir || "");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showMigrateDialog, setShowMigrateDialog] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStep, setMigrationStep] = useState("");

  // Get current data directory from config
  const currentDataDir = config.paths.data_dir || "~/.pyforge";

  // Validate directory on input change
  useEffect(() => {
    const validateTimer = setTimeout(async () => {
      if (dataDirInput.trim()) {
        await validateDirectory(dataDirInput);
      } else {
        setValidationResult(null);
      }
    }, 500);

    return () => clearTimeout(validateTimer);
  }, [dataDirInput]);

  const validateDirectory = async (path: string): Promise<ValidationResult> => {
    setIsValidating(true);
    try {
      const result = await invoke<ValidationResult>("validate_data_dir", { path });
      setValidationResult(result);
      return result;
    } catch (err) {
      const result: ValidationResult = {
        is_valid: false,
        is_writable: false,
        error: err as string,
      };
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const handleBrowseDirectory = async () => {
    try {
      const selected = await invoke<string | null>("select_directory");
      if (selected) {
        setDataDirInput(selected);
      }
    } catch (err) {
      console.error("选择目录失败:", err);
    }
  };

  const handleInputChange = (value: string) => {
    setDataDirInput(value);
    // Don't update config yet - only update after migration succeeds
  };

  const handleMigrateClick = () => {
    if (validationResult?.is_valid && validationResult?.is_writable) {
      setShowMigrateDialog(true);
    }
  };

  const handleConfirmMigration = async () => {
    setIsMigrating(true);
    setMigrationStep("正在准备迁移...");

    try {
      // Call the actual migration command
      await invoke<void>("migrate_data", {
        oldPath: currentDataDir,
        newPath: dataDirInput,
      });

      // Migration successful - update the config
      onChange({
        paths: { ...config.paths, data_dir: dataDirInput || undefined },
      });

      setShowMigrateDialog(false);
      setMigrationStep("");
    } catch (err) {
      console.error("迁移失败:", err);
    } finally {
      setIsMigrating(false);
    }
  };

  const isMigrationEnabled =
    dataDirInput &&
    dataDirInput !== currentDataDir &&
    validationResult?.is_valid &&
    validationResult?.is_writable;

  return (
    <div className="space-y-6">
      {/* Data Directory Section */}
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-4">数据目录</h3>
        <div className="space-y-4">
          {/* Current Directory Display */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              当前数据目录
            </label>
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <code className="text-sm text-slate-600">{currentDataDir}</code>
            </div>
          </div>

          {/* New Directory Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              新数据目录
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入新目录路径或点击浏览"
                value={dataDirInput}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              <button
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg transition-colors"
                onClick={handleBrowseDirectory}
              >
                浏览
              </button>
            </div>

            {/* Validation Status */}
            {isValidating && (
              <div className="mt-2 flex items-center text-sm text-slate-500">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                正在验证目录...
              </div>
            )}

            {validationResult && !isValidating && (
              <div className="mt-2 flex items-center text-sm">
                {validationResult.is_valid && validationResult.is_writable ? (
                  <>
                    <svg
                      className="h-4 w-4 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-green-600">目录可写</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4 text-red-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="text-red-600">
                      {validationResult.error || "目录不可写"}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Migrate Button */}
          <div>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              onClick={handleMigrateClick}
              disabled={!isMigrationEnabled}
            >
              迁移数据到新目录
            </button>
            {dataDirInput && dataDirInput !== currentDataDir && !isMigrationEnabled && (
              <p className="mt-2 text-sm text-slate-500">
                请先选择一个有效的、可写的目录
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Migration Confirmation Dialog */}
      {showMigrateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              确认数据目录迁移
            </h3>

            {!isMigrating ? (
              <>
                <div className="space-y-3 text-sm text-slate-600 mb-6">
                  <p>
                    <span className="font-medium">旧目录:</span>{" "}
                    <code className="bg-slate-100 px-2 py-1 rounded">
                      {currentDataDir}
                    </code>
                  </p>
                  <p>
                    <span className="font-medium">新目录:</span>{" "}
                    <code className="bg-slate-100 px-2 py-1 rounded">
                      {dataDirInput}
                    </code>
                  </p>
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <p className="font-medium mb-2">将要迁移的内容:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>envs/ - Python 环境</li>
                      <li>projects/ - 项目文件</li>
                      <li>kernels/ - Jupyter 内核</li>
                      <li>base/ - 基础环境</li>
                      <li>元数据文件</li>
                      <li>配置文件</li>
                    </ul>
                  </div>
                  <p className="text-orange-600">
                    ⚠️ 迁移完成后应用将自动重启
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                    onClick={() => setShowMigrateDialog(false)}
                  >
                    取消
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    onClick={handleConfirmMigration}
                  >
                    确认迁移
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-slate-700 mb-2">正在迁移数据...</p>
                <p className="text-sm text-slate-500">{migrationStep}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PathSettings;
