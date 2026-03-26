import React, { useEffect, useState } from "react";
import { AppConfig } from "../../types";
import SourceSettings from "./SourceSettings";
import PathSettings from "./PathSettings";
import AboutTab from "./AboutTab";
import { ThemeToggle } from "../ThemeToggle";

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
    {
      id: "sources" as TabId,
      label: "源设置",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    {
      id: "paths" as TabId,
      label: "路径设置",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    {
      id: "about" as TabId,
      label: "关于",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast">
      <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl w-[800px] max-h-[80vh] flex flex-col border border-[var(--color-border)] animate-dialog-enter">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] m-0">设置</h2>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:bg-[var(--color-bg-tertiary)] border-none bg-transparent press-scale"
              onClick={onClose}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex border-b border-[var(--color-border)] px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 press-scale ${
                activeTab === tab.id
                  ? "border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "sources" && (
            <SourceSettings config={config} onChange={handleConfigChange} />
          )}
          {activeTab === "paths" && (
            <PathSettings config={config} onChange={handleConfigChange} />
          )}
          {activeTab === "about" && <AboutTab />}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)] rounded-b-xl">
          {saveSuccess && (
            <span className="text-[var(--color-success)] text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              保存成功
            </span>
          )}
          {!saveSuccess && hasChanges && (
            <span className="text-[var(--color-warning)] text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              有未保存的更改
            </span>
          )}
          {!saveSuccess && !hasChanges && <span />}
          <div className="flex gap-2">
            <button
              className="px-4 py-2 text-sm text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-hover)] transition-all duration-200 press-scale"
              onClick={handleReset}
            >
              重置
            </button>
            <button
              className="px-4 py-2 text-sm text-white bg-[var(--color-accent-primary)] rounded-lg hover:bg-[var(--color-accent-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-[var(--color-accent-glow)] hover:shadow-lg hover-glow flex items-center gap-2 press-scale"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;