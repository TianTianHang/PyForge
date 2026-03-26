import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { Agentation } from "agentation";
import "./App.css";

import { AppState, JupyterInfo, Environment, Project } from "./types";
import { LoadingScreen } from "./components/screens/LoadingScreen";
import { ProgressScreen } from "./components/screens/ProgressScreen";
import { ErrorScreen } from "./components/screens/ErrorScreen";
import { JupyterViewer } from "./components/JupyterViewer";
import { CreateEnvironmentDialog } from "./components/CreateEnvironmentDialog";
import ProjectPanel from "./components/ProjectPanel";
import CreateProjectDialog from "./components/CreateProjectDialog";
import ProjectSettings from "./components/ProjectSettings";
import { usePackageManager } from "./hooks/usePackageManager";
import { useEnvironment } from "./hooks/useEnvironment";
import { useJupyter } from "./hooks/useJupyter";
import { useProject } from "./hooks/useProject";

function App() {
  const [appState, setAppState] = useState<AppState>("checking");
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [currentEnvId, setCurrentEnvId] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [jupyterInfo, setJupyterInfo] = useState<JupyterInfo | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { startJupyter, stopJupyter } = useJupyter({
    setAppState,
    setJupyterInfo,
    setProgressMessage,
    setError,
  });

  const { initializeApp, createEnvironment } = useEnvironment({
    setAppState,
    setEnvironments,
    setCurrentEnvId,
    setProgressMessage,
    setError,
  });

  const { projects, createProject, listProjects, deleteProject } = useProject();

  const {
    listPackages,
    clearPackages,
  } = usePackageManager({
    setError,
    setProgressMessage,
  });

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    const unlisten = listen<string>("env-progress", (event) => {
      setProgressMessage(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    listProjects();
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
    initializeApp();
  };

  const handleStartJupyter = async () => {
    if (currentProjectId) {
      await startJupyter(currentProjectId);
    }
  };

  const handleCreateEnvironment = async (
    name: string,
    pythonVersion: string,
    packageNames: string[]
  ) => {
    await createEnvironment(name, pythonVersion, packageNames);
    setShowCreateDialog(false);
  };

  const handleCreateProject = async (name: string, envId: string) => {
    await createProject(name, envId);
    setShowCreateProjectDialog(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (projectId === currentProjectId) {
      setCurrentProjectId(null);
    }
    await deleteProject(projectId);
  };

  const handleSelectProject = async (projectId: string) => {
    setCurrentProjectId(projectId);
  };

  const renderContent = () => {
    switch (appState) {
      case "checking":
        return <LoadingScreen message="正在检查环境..." />;

      case "initializing":
        return <ProgressScreen message={progressMessage} />;

      case "select_env":
      case "select_project":
        return (
          <ProjectPanel
            projects={projects}
            environments={environments}
            currentProjectId={currentProjectId}
            onCreateProject={async () => {
              setShowCreateProjectDialog(true);
            }}
            onDeleteProject={handleDeleteProject}
            onSelectProject={handleSelectProject}
            onStartJupyter={handleStartJupyter}
            onOpenSettings={(projectId) => {
              const project = projects.find(p => p.id === projectId);
              if (project) {
                setSelectedProject(project);
              }
            }}
            onCreateEnvironment={() => {
              setShowCreateDialog(true);
            }}
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
            project={projects.find((p) => p.id === currentProjectId) ?? null}
          />
        ) : null;

      case "error":
        return <ErrorScreen error={error} onRetry={retry} />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      {renderContent()}
      {showCreateDialog && (
        <CreateEnvironmentDialog
          onClose={() => setShowCreateDialog(false)}
          onCreateEnvironment={handleCreateEnvironment}
          isLoading={false}
        />
      )}
      {showCreateProjectDialog && (
        <CreateProjectDialog
          environments={environments}
          onClose={() => setShowCreateProjectDialog(false)}
          onConfirm={handleCreateProject}
          onCreateEnvironment={() => {
            setShowCreateProjectDialog(false);
            setShowCreateDialog(true);
          }}
        />
      )}
      {selectedProject && (
        <ProjectSettings
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onDeleteProject={handleDeleteProject}
          onCreateEnvironment={createEnvironment}
        />
      )}
      {import.meta.env.DEV && <Agentation
        endpoint="http://localhost:4747"
        onSessionCreated={(sessionId) => {
          console.log("Session started:", sessionId);
        }}
      />}
    </div>
  );
}

export default App;
