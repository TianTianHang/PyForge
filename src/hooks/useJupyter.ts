import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppState, JupyterInfo } from "../types";

interface UseJupyterProps {
  setAppState: (state: AppState) => void;
  setJupyterInfo: (info: JupyterInfo | null) => void;
  setProgressMessage: (message: string) => void;
  setError: (error: string | null) => void;
}

export function useJupyter({
  setAppState,
  setJupyterInfo,
  setProgressMessage,
  setError,
}: UseJupyterProps) {
  const startJupyter = useCallback(async () => {
    try {
      setAppState("starting_jupyter");
      setProgressMessage("正在启动 Jupyter Server...");

      const info = await invoke<JupyterInfo>("start_jupyter");
      setJupyterInfo(info);
      setAppState("ready");
    } catch (err) {
      setError(err as string);
      setAppState("error");
    }
  }, [setAppState, setJupyterInfo, setProgressMessage, setError]);

  const stopJupyter = useCallback(async () => {
    try {
      await invoke<string>("stop_jupyter");
      setJupyterInfo(null);
      setAppState("no_env");
    } catch (err) {
      console.error("停止 Jupyter 失败:", err);
    }
  }, [setAppState, setJupyterInfo]);

  return { startJupyter, stopJupyter };
}
