import { Environment, InstalledPackage } from "../types";
import "../App.css";
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
    <div className="environment-panel-page">
      <div className="environment-panel">
        <div className="environment-list-section">
          <div className="section-header">
            <h3>环境管理</h3>
            <button
              type="button"
              className="primary-button"
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

      <button
        type="button"
        className="toolbar-button bottom-toolbar-button"
        onClick={onStartJupyter}
        disabled={!currentEnvId}
      >
        {currentEnvironment ? `启动 Jupyter (${currentEnvironment.name})` : "请选择环境"}
      </button>
    </div>
  );
}
