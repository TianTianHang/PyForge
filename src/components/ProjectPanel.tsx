import React, { useState } from 'react';
import { Project, Environment } from '../types';
import ProjectList from './ProjectList';
import CreateProjectDialog from './CreateProjectDialog';
import './ProjectPanel.css';

interface ProjectPanelProps {
  projects: Project[];
  environments: Environment[];
  currentProjectId: string | null;
  onCreateProject: (name: string, envId: string) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onSelectProject: (projectId: string) => void;
  onStartJupyter: (projectId: string) => void;
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
    <div className="project-panel">
      <div className="project-panel-header">
        <h2>项目</h2>
        <div className="project-panel-actions">
          <button
            className="create-button"
            onClick={() => setShowCreateDialog(true)}
          >
            新建项目
          </button>
        </div>
      </div>

      <div className="project-panel-content">
        {projects.length > 0 ? (
          <ProjectList
            projects={projects}
            onSelectProject={handleSelectProject}
            onDeleteProject={onDeleteProject}
            isCurrentProject={isCurrentProject}
          />
        ) : (
          <div className="empty-state">
            <p>暂无项目</p>
            <button
              className="create-button"
              onClick={() => setShowCreateDialog(true)}
            >
              创建第一个项目
            </button>
          </div>
        )}
      </div>

      {currentProject && (
        <div className="project-panel-footer">
          <div className="current-project-info">
            <h3>当前项目: {currentProject.name}</h3>
            <p>环境: {currentProject.env_id}</p>
          </div>
          <button
            className="start-button"
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