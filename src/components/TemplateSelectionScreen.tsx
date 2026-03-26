import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Template } from "../types";
import { ProgressScreen } from "./screens/ProgressScreen";
import { listen } from "@tauri-apps/api/event";

interface TemplateSelectionScreenProps {
  onComplete: () => void;
  onError: (error: string) => void;
}

export function TemplateSelectionScreen({ onComplete, onError }: TemplateSelectionScreenProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [progressMessage, setProgressMessage] = useState("");
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    invoke<Template[]>("list_templates")
      .then(setTemplates)
      .catch(() => {
        setTemplates([]);
      })
      .finally(() => setLoadingTemplates(false));
  }, []);

  useEffect(() => {
    const unlisten = listen<string>("env-progress", (event) => {
      setProgressMessage(event.payload);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleSelect = (id: string) => {
    if (loading) return;
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleCreate = async () => {
    if (!selectedId || loading) return;
    setLoading(true);
    setShowProgress(true);

    try {
      await invoke("create_environment_from_template", { templateId: selectedId });
      onComplete();
    } catch (err) {
      onError(err as string);
      setShowProgress(false);
      setLoading(false);
      setProgressMessage("");
    }
  };

  if (loadingTemplates) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[var(--color-border)] rounded-full"></div>
          <div className="absolute w-12 h-12 border-2 border-transparent border-t-[var(--color-accent-primary)] rounded-full animate-spin"></div>
          <p className="text-[var(--color-text-secondary)]">加载模板中...</p>
        </div>
      </div>
    );
  }

  if (showProgress) {
    return <ProgressScreen message={progressMessage} />;
  }

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="flex flex-col items-center gap-8 max-w-2xl w-full">
        <div className="flex flex-col items-center gap-2 animate-slide-down">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            欢迎使用 PyForge
          </h1>
          <p className="text-[var(--color-text-secondary)]">选择一个环境模板开始：</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full justify-items-center">
          {templates.map((template, index) => {
            const isSelected = selectedId === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => handleSelect(template.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(template.id);
                  }
                }}
                className={`
                  p-5 rounded-xl border-2 text-left transition-all duration-200 max-w-[400px] w-full animate-slide-up press-scale
                  ${isSelected
                    ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5 shadow-md shadow-[var(--color-accent-glow)]/50"
                    : "border-[var(--color-border)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-bg-tertiary)]"
                  }
                  ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-primary)]
                `}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-semibold text-lg mb-1 ${
                        isSelected
                          ? "text-[var(--color-accent-primary)]"
                          : "text-[var(--color-text-primary)]"
                      }`}
                    >
                      {template.display_name}
                    </div>
                    <div className="text-sm text-[var(--color-text-secondary)] mb-3">
                      {template.description}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {template.dependencies.slice(0, 3).map((dep) => {
                        const name = dep.split(">=")[0].split("<")[0].split("==")[0].split("~=")[0];
                        return (
                          <span
                            key={dep}
                            className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]"
                          >
                            {name}
                          </span>
                        );
                      })}
                      {template.dependencies.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]">
                          +{template.dependencies.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.use_cases.map((uc) => (
                        <span
                          key={uc}
                          className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]"
                        >
                          {uc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!selectedId || loading}
          onClick={handleCreate}
          className={`
            px-8 py-3 rounded-lg font-medium text-base transition-all duration-200 animate-fade-in press-scale
            ${
              selectedId && !loading
                ? "bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-secondary)] shadow-lg shadow-[var(--color-accent-glow)]/50 hover-glow"
                : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] cursor-not-allowed"
            }
          `}
          style={{ animationDelay: '200ms' }}
        >
          {loading ? "创建中..." : "创建并开始"}
        </button>
      </div>
    </div>
  );
}
