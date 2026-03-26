import { InstalledPackage } from "../types";

interface PackageListProps {
  packages: InstalledPackage[];
  isLoading: boolean;
  onUninstallPackage: (packageName: string) => void;
}

export function PackageList({
  packages,
  isLoading,
  onUninstallPackage,
}: PackageListProps) {
  if (isLoading) {
    return <div className="flex flex-col items-center justify-center p-8 text-[var(--color-text-tertiary)] text-center flex-1">正在加载包列表...</div>;
  }

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-[var(--color-text-tertiary)] text-center flex-1">
        <p>暂无已安装的包</p>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto flex-1">
      {packages.map((pkg) => (
        <div key={pkg.name} className="flex justify-between items-center px-3 py-2.5 border border-[var(--color-border)] rounded-md mb-2 bg-[var(--color-bg-tertiary)]">
          <div className="flex items-center gap-4">
            <span className="font-medium text-[var(--color-text-primary)]">{pkg.name}</span>
            <span className="text-sm text-[var(--color-text-secondary)]">{pkg.version}</span>
          </div>
          <button
            type="button"
            className="bg-amber-500 hover:bg-amber-600 text-white border-none px-3 py-1.5 text-sm rounded cursor-pointer transition-colors"
            onClick={() => onUninstallPackage(pkg.name)}
          >
            卸载
          </button>
        </div>
      ))}
    </div>
  );
}
