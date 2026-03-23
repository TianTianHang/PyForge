import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

import { AppState, EnvStatus, JupyterInfo } from "./types";
import { LoadingScreen } from "./components/screens/LoadingScreen";
import { WelcomeScreen } from "./components/screens/WelcomeScreen";
import { ProgressScreen } from "./components/screens/ProgressScreen";
import { ErrorScreen } from "./components/screens/ErrorScreen";
import { JupyterViewer } from "./components/JupyterViewer";
import { useEnvironment } from "./hooks/useEnvironment";
import { useJupyter } from "./hooks/useJupyter";

function App() {
  const [appState, setAppState] = useState<AppState>("checking");
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [jupyterInfo, setJupyterInfo] = useState<JupyterInfo | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { startJupyter, stopJupyter } = useJupyter({
    setAppState,
    setJupyterInfo,
    setProgressMessage,
    setError,
  });

  const { checkEnvironment, createEnvironment } = useEnvironment({
    setAppState,
    setEnvStatus,
    setProgressMessage,
    setError,
    startJupyter,
  });

  useEffect(() => {
    checkEnvironment();
  }, [checkEnvironment]);

  useEffect(() => {
    const unlisten = listen<string>("env-progress", (event) => {
      setProgressMessage(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const retry = () => {
    setError(null);
    checkEnvironment();
  };

  const renderContent = () => {
    switch (appState) {
      case "checking":
        return <LoadingScreen message="正在检查环境..." />;

      case "no_env":
        return (
          <WelcomeScreen
            onCreateEnv={createEnvironment}
            envPath={envStatus?.path}
          />
        );

      case "creating_env":
        return <ProgressScreen message={progressMessage} />;

      case "starting_jupyter":
        return <LoadingScreen message={progressMessage} />;

      case "ready":
        return jupyterInfo ? (
          <JupyterViewer
            url={jupyterInfo.url}
            onStop={stopJupyter}
          />
        ) : null;

      case "error":
        return <ErrorScreen error={error} onRetry={retry} />;
    }
  };

  return <div className="app">{renderContent()}</div>;
}

export default App;
