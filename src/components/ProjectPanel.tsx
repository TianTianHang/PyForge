import React, { useState } from 'react';
import { Project, Environment } from '../types';
import ProjectList from './ProjectList';
import CreateProjectDialog from './CreateProjectDialog';

interface ProjectPanelProps {
  projects: Project[];
  environments: Environment[];
  currentProjectId: string | null;
  onCreateProject: (name: string, envId: string) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onSelectProject: (projectId: string) => void;
  onStartJupyter: (projectId: string) => void;
  onOpenSettings: (projectId: string) => void;
  onCreateEnvironment?: () => void;
}

const ProjectPanel: React.FC<ProjectPanelProps> = ({
  projects,
  environments,
  currentProjectId,
  onCreateProject,
  onDeleteProject,
  onSelectProject,
  onStartJupyter,
  onOpenSettings,
  onCreateEnvironment,
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const handleCreateProject = async (name: string, envId: string) => {
    try {
      await onCreateProject(name, envId);
      setShowCreateDialog(false);
    } catch (err) {
      console.error('创建项目失败:', err);
    }
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      onSelectProject(projectId);
    }
  };

  const handleStartJupyter = () => {
    if (currentProject) {
      onStartJupyter(currentProject.id);
    }
  };

  const isCurrentProject = (projectId: string) => {
    return currentProjectId === projectId;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 m-0">项目</h2>
        <div className="flex gap-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white border-none px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors"
            onClick={() => setShowCreateDialog(true)}
          >
            新建项目
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {projects.length > 0 ? (
          <ProjectList
            projects={projects}
            onSelectProject={handleSelectProject}
            onDeleteProject={onDeleteProject}
            onOpenSettings={onOpenSettings}
            isCurrentProject={isCurrentProject}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
            <p className="mb-4">暂无项目</p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white border-none px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors"
              onClick={() => setShowCreateDialog(true)}
            >
              创建第一个项目
            </button>
          </div>
        )}
      </div>

      {currentProject && (
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-800 m-0">当前项目: {currentProject.name}</h3>
            <p className="text-sm text-slate-500 mt-1">环境: {currentProject.env_id}</p>
          </div>
          <button
            className="bg-green-500 hover:bg-green-600 text-white border-none px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors"
            onClick={handleStartJupyter}
          >
            启动 Jupyter
          </button>
        </div>
      )}

      {showCreateDialog && (
        <CreateProjectDialog
          environments={environments}
          onClose={() => setShowCreateDialog(false)}
          onConfirm={handleCreateProject}
          onCreateEnvironment={onCreateEnvironment}
        />
      )}
    </div>
  );
};

export default ProjectPanel;
