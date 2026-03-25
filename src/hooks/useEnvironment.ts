import { useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppState, Environment } from "../types";

interface UseEnvironmentProps {
  setAppState: (state: AppState) => void;
  setEnvironments: (environments: Environment[]) => void;
  setCurrentEnvId: (envId: string | null) => void;
  setProgressMessage: (message: string) => void;
  setError: (error: string | null) => void;
}

export function useEnvironment({
  setAppState,
  setEnvironments,
  setCurrentEnvId,
  setProgressMessage,
  setError,
}: UseEnvironmentProps) {
  const isInitializingRef = useRef(false);

  const listEnvironments = useCallback(async () => {
    try {
      const envs = await invoke<Environment[]>("list_environments");
      setEnvironments(envs);
      const currentEnvId = envs[0]?.id ?? null;
      setCurrentEnvId(currentEnvId);
      return envs;
    } catch (err) {
      setError(err as string);
      return [];
    }
  }, [setEnvironments, setCurrentEnvId, setError]);

  const initializeApp = useCallback(async () => {
    if (isInitializingRef.current) {
      console.warn("[initializeApp] Duplicate initialization attempt blocked");
      return;
    }

    try {
      isInitializingRef.current = true;
      console.log("[initializeApp] Starting initialization");
      setAppState("checking");
      setProgressMessage("正在初始化...");

      setAppState("initializing");
      await invoke<string>("initialize_app");

      const envs = await listEnvironments();
      if (envs.length > 0) {
        // Transition to project selection instead of environment selection
        setAppState("select_project");
      } else {
        setError("初始化完成但未找到环境");
        setAppState("error");
      }
    } catch (err) {
      setError(err as string);
      setAppState("error");
    } finally {
      isInitializingRef.current = false;
    }
  }, [listEnvironments, setAppState, setProgressMessage, setError]);

  const createEnvironment = useCallback(async (
    name: string,
    pythonVersion: string,
    packages: string[],
    projectId?: string | null
  ) => {
    try {
      setProgressMessage("正在创建环境...");
      const env = await invoke<Environment>("create_environment", {
        name,
        pythonVersion,
        packages,
      });

      // If projectId is provided and auto-binding is supported, bind the kernel
      if (projectId) {
        await invoke("bind_kernel_command", {
          projectId,
          envId: env.id,
        });
      }

      await listEnvironments();
    } catch (err) {
      setError(err as string);
    }
  }, [listEnvironments, setError, setProgressMessage]);

  const deleteEnvironment = useCallback(async (envId: string) => {
    try {
      await invoke<void>("delete_environment", { envId });
      const envs = await listEnvironments();
      if (envs.length === 0) {
        setError("没有可用的环境");
        setAppState("error");
      }
    } catch (err) {
      setError(err as string);
      setAppState("error");
    }
  }, [listEnvironments, setAppState, setError]);

  return { initializeApp, listEnvironments, createEnvironment, deleteEnvironment };
}
