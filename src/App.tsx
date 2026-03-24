import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

import { AppState, EnvStatus, JupyterInfo, Environment } from "./types";
import { LoadingScreen } from "./components/screens/LoadingScreen";
import { ProgressScreen } from "./components/screens/ProgressScreen";
import { ErrorScreen } from "./components/screens/ErrorScreen";
import { JupyterViewer } from "./components/JupyterViewer";
import { EnvironmentPanel } from "./components/EnvironmentPanel";
import { CreateEnvironmentDialog } from "./components/CreateEnvironmentDialog";
import { usePackageManager } from "./hooks/usePackageManager";
import { useEnvironment } from "./hooks/useEnvironment";
import { useJupyter } from "./hooks/useJupyter";

function App() {
  const [appState, setAppState] = useState<AppState>("checking");
  const [, setEnvStatus] = useState<EnvStatus | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [currentEnvId, setCurrentEnvId] = useState<string | null>(null);
  const [jupyterInfo, setJupyterInfo] = useState<JupyterInfo | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { startJupyter, stopJupyter } = useJupyter({
    setAppState,
    setJupyterInfo,
    setProgressMessage,
    setError,
  });

  const { checkEnvironment, createEnvironment, deleteEnvironment } = useEnvironment({
    setAppState,
    setEnvStatus,
    setEnvironments,
    setCurrentEnvId,
    setProgressMessage,
    setError,
  });

  const {
    packages,
    listPackages,
    clearPackages,
    installPackage,
    uninstallPackage,
    isLoading: packagesLoading,
  } = usePackageManager({
    setError,
    setProgressMessage,
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

  useEffect(() => {
    if (!currentEnvId) {
      clearPackages();
      return;
    }

    listPackages(currentEnvId);
  }, [currentEnvId, listPackages, clearPackages]);

  const retry = () => {
    setError(null);
    checkEnvironment();
  };

  const handleStartJupyter = async () => {
    await startJupyter(currentEnvId);
  };

  const handleCreateEnvironment = async (
    name: string,
    pythonVersion: string,
    packageNames: string[]
  ) => {
    await createEnvironment(name, pythonVersion, packageNames);
    setShowCreateDialog(false);
  };

  const handleDeleteEnvironment = async (envId: string) => {
    if (envId === currentEnvId) {
      setCurrentEnvId(null);
      clearPackages();
    }
    await deleteEnvironment(envId);
  };

  const handleInstallPackage = async (packageName: string) => {
    if (!currentEnvId) {
      return;
    }

    await installPackage(currentEnvId, packageName);
  };

  const handleUninstallPackage = async (packageName: string) => {
    if (!currentEnvId) {
      return;
    }

    await uninstallPackage(currentEnvId, packageName);
  };

  const handleRefreshPackages = async () => {
    if (!currentEnvId) {
      return;
    }

    await listPackages(currentEnvId);
  };

  const renderContent = () => {
    switch (appState) {
      case "checking":
        return <LoadingScreen message="正在检查环境..." />;

      case "no_env":
        return (
          <div className="welcome-screen">
            <h1>Welcome to PyForge</h1>
            <p>创建您的第一个 Python 开发环境</p>
            <div className="welcome-info">
              <button
                type="button"
                className="primary-button"
                onClick={() => setShowCreateDialog(true)}
              >
                创建环境
              </button>
            </div>
          </div>
        );

      case "creating_env":
        return <ProgressScreen message={progressMessage} />;

      case "select_env":
        return (
          <EnvironmentPanel
            environments={environments}
            currentEnvId={currentEnvId}
            selectedEnvPackages={packages}
            isLoading={packagesLoading}
            onSelectEnvironment={setCurrentEnvId}
            onStartJupyter={handleStartJupyter}
            onCreateEnvironment={() => setShowCreateDialog(true)}
            onDeleteEnvironment={handleDeleteEnvironment}
            onRefreshPackages={handleRefreshPackages}
            onInstallPackage={handleInstallPackage}
            onUninstallPackage={handleUninstallPackage}
          />
        );

      case "starting_jupyter":
        return <LoadingScreen message={progressMessage} />;

      case "ready":
        return jupyterInfo ? (
          <JupyterViewer
            url={jupyterInfo.url}
            onStop={stopJupyter}
            environment={environments.find((env) => env.id === currentEnvId) ?? null}
          />
        ) : null;

      case "error":
        return <ErrorScreen error={error} onRetry={retry} />;
    }
  };

  return (
    <div className="app">
      {renderContent()}
      {showCreateDialog && (
        <CreateEnvironmentDialog
          onClose={() => setShowCreateDialog(false)}
          onCreateEnvironment={handleCreateEnvironment}
          isLoading={appState === "creating_env"}
        />
      )}
    </div>
  );
}

export default App;
