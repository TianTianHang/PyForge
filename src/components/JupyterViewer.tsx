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
    <div className="flex flex-col h-full w-full">
      {showProjectSettings && project && (
        <ProjectSettings
          project={project}
          onClose={() => setShowProjectSettings(false)}
        />
      )}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-white">
        <span className="font-semibold text-base">
          PyForge {project && `- ${project.name}`}
        </span>
        <div className="flex gap-2">
          {project && (
            <button
              className="bg-white/10 text-white border border-white/20 px-4 py-1.5 text-sm rounded cursor-pointer transition-colors hover:bg-white/20"
              onClick={() => setShowProjectSettings(true)}
            >
              项目设置
            </button>
          )}
          <button
            className="bg-white/10 text-white border border-white/20 px-4 py-1.5 text-sm rounded cursor-pointer transition-colors hover:bg-white/20"
            onClick={onStop}
          >
            停止
          </button>
        </div>
      </div>
      {(environment || project) && (
        <div className="bg-white/95 px-4 py-2 text-sm text-slate-500 border-b border-slate-200 backdrop-blur-sm">
          {project && <span className="after:content-['•'] after:mx-2 after:text-slate-300">项目: {project.name}</span>}
          {environment && (
            <span>Python {environment.python_version} | 内核: {environment.kernel_name}</span>
          )}
        </div>
      )}
      <iframe
        src={url}
        className="flex-1 w-full border-0"
        title="JupyterLab"
        allow="clipboard-read; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
}
