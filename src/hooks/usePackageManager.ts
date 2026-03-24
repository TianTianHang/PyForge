import { useCallback, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { InstalledPackage } from "../types";

interface UsePackageManagerProps {
  setError: (error: string | null) => void;
  setProgressMessage: (message: string) => void;
}

export function usePackageManager({
  setError,
  setProgressMessage,
}: UsePackageManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<InstalledPackage[]>([]);

  const listPackages = useCallback(async (envId: string) => {
    try {
      setIsLoading(true);
      const installedPackages = await invoke<InstalledPackage[]>("list_packages", { envId });
      setPackages(installedPackages);
      return installedPackages;
    } catch (err) {
      setError(err as string);
      setPackages([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  const clearPackages = useCallback(() => {
    setPackages([]);
  }, []);

  const installPackage = useCallback(async (
    envId: string,
    packageName: string
  ) => {
    try {
      setIsLoading(true);
      setProgressMessage(`正在安装 ${packageName}...`);
      await invoke<void>("install_package", { envId, packageName });
      setProgressMessage(`${packageName} 安装完成`);
      const installedPackages = await invoke<InstalledPackage[]>("list_packages", { envId });
      setPackages(installedPackages);
    } catch (err) {
      setError(err as string);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setError, setProgressMessage]);

  const uninstallPackage = useCallback(async (
    envId: string,
    packageName: string
  ) => {
    try {
      setIsLoading(true);
      setProgressMessage(`正在卸载 ${packageName}...`);
      await invoke<void>("uninstall_package", { envId, packageName });
      setProgressMessage(`${packageName} 卸载完成`);
      const installedPackages = await invoke<InstalledPackage[]>("list_packages", { envId });
      setPackages(installedPackages);
    } catch (err) {
      setError(err as string);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setError, setProgressMessage]);

  return {
    packages,
    listPackages,
    clearPackages,
    installPackage,
    uninstallPackage,
    isLoading,
  };
}
