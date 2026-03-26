import { useCallback, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  AppConfig,
  ValidationResult,
  MigrationResult,
} from "../types";

interface UseSettingsProps {
  setError: (error: string | null) => void;
  setProgressMessage: (message: string) => void;
}

export function useSettings({
  setError,
  setProgressMessage,
}: UseSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);

  /**
   * Get the current application configuration
   */
  const getConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const appConfig = await invoke<AppConfig>("get_config");
      setConfig(appConfig);
      return appConfig;
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw errorMessage;
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  /**
   * Update the application configuration
   */
  const updateConfig = useCallback(async (newConfig: AppConfig) => {
    try {
      setIsLoading(true);
      setProgressMessage("正在保存配置...");
      await invoke<void>("update_config", { config: newConfig });
      setConfig(newConfig);
      setProgressMessage("配置保存成功");

      // Clear success message after 2 seconds
      setTimeout(() => setProgressMessage(""), 2000);
      return newConfig;
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      setProgressMessage("");
      throw errorMessage;
    } finally {
      setIsLoading(false);
    }
  }, [setError, setProgressMessage]);

  /**
   * Validate if a directory is writable
   */
  const validateDataDir = useCallback(async (path: string): Promise<ValidationResult> => {
    try {
      setIsLoading(true);
      const isValid = await invoke<boolean>("validate_data_dir", { path });

      if (isValid) {
        return { is_valid: true, is_writable: true };
      } else {
        return {
          is_valid: false,
          is_writable: false,
          error: "目录不可写或无法创建",
        };
      }
    } catch (err) {
      const errorMessage = err as string;
      return {
        is_valid: false,
        is_writable: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Migrate data from old directory to new directory
   */
  const migrateData = useCallback(async (
    oldPath: string,
    newPath: string
  ): Promise<MigrationResult> => {
    try {
      setIsLoading(true);
      setProgressMessage("正在迁移数据...");

      await invoke<void>("migrate_data", {
        oldPath,
        newPath,
      });

      setProgressMessage("数据迁移完成");

      // Clear success message after 2 seconds
      setTimeout(() => setProgressMessage(""), 2000);

      return { success: true };
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      setProgressMessage("");
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [setError, setProgressMessage]);

  return {
    config,
    isLoading,
    getConfig,
    updateConfig,
    validateDataDir,
    migrateData,
  };
}
