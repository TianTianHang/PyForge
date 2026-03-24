import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppState, EnvStatus, Environment } from "../types";

interface UseEnvironmentProps {
  setAppState: (state: AppState) => void;
  setEnvStatus: (status: EnvStatus | null) => void;
  setEnvironments: (environments: Environment[]) => void;
  setCurrentEnvId: (envId: string | null) => void;
  setProgressMessage: (message: string) => void;
  setError: (error: string | null) => void;
}

export function useEnvironment({
  setAppState,
  setEnvStatus,
  setEnvironments,
  setCurrentEnvId,
  setProgressMessage,
  setError,
}: UseEnvironmentProps) {
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

  const checkEnvironment = useCallback(async () => {
    try {
      setAppState("checking");
      const status = await invoke<EnvStatus>("check_env");
      setEnvStatus(status);

      if (!status.exists) {
        setAppState("no_env");
        return;
      }

      const envs = await listEnvironments();
      if (envs.length > 0) {
        setAppState("select_env");
      } else {
        setAppState("no_env");
      }
    } catch (err) {
      setError(err as string);
      setAppState("error");
    }
  }, [listEnvironments, setAppState, setEnvStatus, setError]);

  const createEnvironment = useCallback(async (
    name = "Default",
    pythonVersion = "3.12",
    packages = ["numpy", "pandas", "matplotlib", "ipykernel", "jupyterlab"]
  ) => {
    try {
      setAppState("creating_env");
      setProgressMessage("正在准备环境...");

      if (name === "Default") {
        await invoke<string>("create_env");
      } else {
        await invoke<Environment>("create_environment", {
          name,
          pythonVersion,
          packages,
        });
      }

      const envs = await listEnvironments();
      const createdEnv = envs.find((env) => env.name === name) ?? envs[0] ?? null;
      setCurrentEnvId(createdEnv?.id ?? null);
      setAppState(envs.length > 0 ? "select_env" : "no_env");
    } catch (err) {
      setError(err as string);
      setAppState("error");
    }
  }, [listEnvironments, setAppState, setCurrentEnvId, setError, setProgressMessage]);

  const deleteEnvironment = useCallback(async (envId: string) => {
    try {
      await invoke<void>("delete_environment", { envId });
      const envs = await listEnvironments();
      setAppState(envs.length > 0 ? "select_env" : "no_env");
    } catch (err) {
      setError(err as string);
      setAppState("error");
    }
  }, [listEnvironments, setAppState, setError]);

  return { checkEnvironment, listEnvironments, createEnvironment, deleteEnvironment };
}
