import { InstalledPackage } from "../types";
import "../App.css";

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
    return <div className="empty-packages">正在加载包列表...</div>;
  }

  if (packages.length === 0) {
    return (
      <div className="empty-packages">
        <p>暂无已安装的包</p>
      </div>
    );
  }

  return (
    <div className="package-items">
      {packages.map((pkg) => (
        <div key={pkg.name} className="package-item">
          <div className="package-info">
            <span className="package-name">{pkg.name}</span>
            <span className="package-version">{pkg.version}</span>
          </div>
          <button
            type="button"
            className="uninstall-button"
            onClick={() => onUninstallPackage(pkg.name)}
          >
            卸载
          </button>
        </div>
      ))}
    </div>
  );
}
