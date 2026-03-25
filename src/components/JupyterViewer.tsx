import { Environment, Project } from "../types";
import { useState } from "react";
import ProjectSettings from "./ProjectSettings";

export function JupyterViewer({
  url,
  onStop,
  environment,
  project,
}: {
  url: string;
  onStop: () => void;
  environment?: Environment | null;
  project?: Project | null;
}) {
  const [showProjectSettings, setShowProjectSettings] = useState(false);

  return (
    <div className="jupyter-viewer">
      {showProjectSettings && project && (
        <ProjectSettings
          project={project}
          onClose={() => setShowProjectSettings(false)}
        />
      )}
      <div className="jupyter-toolbar">
        <span className="toolbar-title">
          PyForge {project && `- ${project.name}`}
        </span>
        <div className="toolbar-actions">
          {project && (
            <button
              className="toolbar-button settings-button"
              onClick={() => setShowProjectSettings(true)}
            >
              项目设置
            </button>
          )}
          <button className="toolbar-button stop-button" onClick={onStop}>
            停止
          </button>
        </div>
      </div>
      {(environment || project) && (
        <div className="environment-info">
          {project && <span>项目: {project.name} | </span>}
          {environment && (
            <span>Python {environment.python_version} | 内核: {environment.kernel_name}</span>
          )}
        </div>
      )}
      <iframe
        src={url}
        className="jupyter-iframe"
        title="JupyterLab"
        allow="clipboard-read; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
}
