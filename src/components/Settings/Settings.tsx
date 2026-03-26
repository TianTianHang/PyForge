import React, { useEffect, useState } from "react";
import { AppConfig } from "../../types";
import SourceSettings from "./SourceSettings";
import PathSettings from "./PathSettings";
import AboutTab from "./AboutTab";

interface SettingsProps {
  onClose: () => void;
  initialConfig: AppConfig;
  onSave: (config: AppConfig) => Promise<void>;
  onReset: () => Promise<AppConfig>;
}

type TabId = "sources" | "paths" | "about";

const Settings: React.FC<SettingsProps> = ({
  onClose,
  initialConfig,
  onSave,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("sources");
  const [config, setConfig] = useState<AppConfig>(initialConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setHasChanges(JSON.stringify(config) !== JSON.stringify(initialConfig));
  }, [config, initialConfig]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("保存配置失败:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const defaultConfig = await onReset();
      setConfig(defaultConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("重置配置失败:", err);
    }
  };

  const handleConfigChange = (updates: Partial<AppConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const tabs = [
    { id: "sources" as TabId, label: "源设置", icon: "🔗" },
    { id: "paths" as TabId, label: "路径设置", icon: "📁" },
    { id: "about" as TabId, label: "关于", icon: "ℹ️" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[800px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 m-0">设置</h2>
          <button
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none border-none bg-transparent cursor-pointer transition-colors"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "sources" && (
            <SourceSettings config={config} onChange={handleConfigChange} />
          )}
          {activeTab === "paths" && (
            <PathSettings config={config} onChange={handleConfigChange} />
          )}
          {activeTab === "about" && <AboutTab />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          {saveSuccess && (
            <span className="text-green-600 text-sm">✓ 保存成功</span>
          )}
          {!saveSuccess && hasChanges && (
            <span className="text-slate-500 text-sm">有未保存的更改</span>
          )}
          {!saveSuccess && !hasChanges && <span />}
          <div className="flex gap-2">
            <button
              className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={handleReset}
            >
              重置
            </button>
            <button
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
