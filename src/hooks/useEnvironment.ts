import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppState, EnvStatus } from "../types";

interface UseEnvironmentProps {
  setAppState: (state: AppState) => void;
  setEnvStatus: (status: EnvStatus | null) => void;
  setProgressMessage: (message: string) => void;
  setError: (error: string | null) => void;
  startJupyter: () => Promise<void>;
}

export function useEnvironment({
  setAppState,
  setEnvStatus,
  setProgressMessage,
  setError,
  startJupyter,
}: UseEnvironmentProps) {
  const checkEnvironment = useCallback(async () => {
    try {
      setAppState("checking");
      const status = await invoke<EnvStatus>("check_env");
      setEnvStatus(status);

      if (status.exists) {
        await startJupyter();
      } else {
        setAppState("no_env");
      }
    } catch (err) {
      setError(err as string);
      setAppState("error");
    }
  }, [setAppState, setEnvStatus, setError, startJupyter]);

  const createEnvironment = useCallback(async () => {
    try {
      setAppState("creating_env");
      setProgressMessage("正在准备环境...");

      await invoke<string>("create_env");

      await startJupyter();
    } catch (err) {
      setError(err as string);
      setAppState("error");
    }
  }, [setAppState, setProgressMessage, setError, startJupyter]);

  return { checkEnvironment, createEnvironment };
}
