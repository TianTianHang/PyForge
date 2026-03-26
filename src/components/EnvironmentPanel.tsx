import { Environment, InstalledPackage } from "../types";
import { EnvironmentList } from "./EnvironmentList";
import { EnvironmentDetail } from "./EnvironmentDetail";

interface EnvironmentPanelProps {
  environments: Environment[];
  currentEnvId: string | null;
  selectedEnvPackages: InstalledPackage[];
  isLoading: boolean;
  onSelectEnvironment: (envId: string) => void;
  onStartJupyter: () => void;
  onCreateEnvironment: () => void;
  onDeleteEnvironment: (envId: string) => void;
  onRefreshPackages: () => void;
  onInstallPackage: (packageName: string) => void;
  onUninstallPackage: (packageName: string) => void;
}

export function EnvironmentPanel({
  environments,
  currentEnvId,
  selectedEnvPackages,
  isLoading,
  onSelectEnvironment,
  onStartJupyter,
  onCreateEnvironment,
  onDeleteEnvironment,
  onRefreshPackages,
  onInstallPackage,
  onUninstallPackage,
}: EnvironmentPanelProps) {
  const currentEnvironment = environments.find((env) => env.id === currentEnvId) ?? null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] m-0">环境管理</h3>
            <button
              type="button"
              className="bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white border-none px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors"
              onClick={onCreateEnvironment}
            >
              创建新环境
            </button>
          </div>

          <EnvironmentList
            environments={environments}
            currentEnvId={currentEnvId}
            onSelectEnvironment={onSelectEnvironment}
            onStartJupyter={onStartJupyter}
            onDeleteEnvironment={onDeleteEnvironment}
          />
        </div>

        <EnvironmentDetail
          environment={currentEnvironment}
          packages={selectedEnvPackages}
          isLoading={isLoading}
          onRefreshPackages={onRefreshPackages}
          onInstallPackage={onInstallPackage}
          onUninstallPackage={onUninstallPackage}
        />
      </div>

      <div className="relative mt-4">
        <button
          type="button"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 min-w-[200px] bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white border-none px-6 py-2.5 text-sm rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onStartJupyter}
          disabled={!currentEnvId}
        >
          {currentEnvironment ? `启动 Jupyter (${currentEnvironment.name})` : "请选择环境"}
        </button>
      </div>
    </div>
  );
}
