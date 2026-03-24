import { Environment, InstalledPackage } from "../types";
import "../App.css";
import { PackageList } from "./PackageList";
import { InstallPackageInput } from "./InstallPackageInput";

interface EnvironmentDetailProps {
  environment: Environment | null;
  packages: InstalledPackage[];
  isLoading: boolean;
  onRefreshPackages: () => void;
  onInstallPackage: (packageName: string) => void;
  onUninstallPackage: (packageName: string) => void;
}

export function EnvironmentDetail({
  environment,
  packages,
  isLoading,
  onRefreshPackages,
  onInstallPackage,
  onUninstallPackage,
}: EnvironmentDetailProps) {
  if (!environment) {
    return (
      <div className="package-section empty-detail">
        <div className="empty-packages">
          <p>请选择一个环境查看详情</p>
        </div>
      </div>
    );
  }

  return (
    <div className="package-section">
      <div className="section-header">
        <h3>包管理 - {environment.name}</h3>
        <button
          type="button"
          className="refresh-button"
          disabled={isLoading}
          onClick={onRefreshPackages}
        >
          {isLoading ? "加载中..." : "刷新"}
        </button>
      </div>

      <PackageList
        packages={packages}
        isLoading={isLoading}
        onUninstallPackage={onUninstallPackage}
      />

      <div className="package-actions">
        <InstallPackageInput
          disabled={isLoading}
          onInstallPackage={onInstallPackage}
        />
      </div>
    </div>
  );
}
