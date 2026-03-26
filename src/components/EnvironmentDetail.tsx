import { Environment, InstalledPackage } from "../types";
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
      <div className="w-[400px] flex flex-col overflow-hidden bg-white rounded-lg shadow-sm">
        <div className="flex flex-col items-center justify-center p-8 text-slate-400 text-center flex-1">
          <p>请选择一个环境查看详情</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[400px] flex flex-col overflow-hidden bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-lg font-semibold text-slate-800 m-0">包管理 - {environment.name}</h3>
        <button
          type="button"
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 border-none px-3 py-1.5 text-sm rounded cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="p-4 border-t border-slate-200">
        <InstallPackageInput
          disabled={isLoading}
          onInstallPackage={onInstallPackage}
        />
      </div>
    </div>
  );
}
