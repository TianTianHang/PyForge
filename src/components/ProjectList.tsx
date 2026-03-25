import React, { useState } from 'react';
import { Project } from '../types';
import { useProject } from '../hooks/useProject';
import './ProjectList.css';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  isCurrentProject: (projectId: string) => boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onSelectProject,
  onDeleteProject,
  isCurrentProject,
}) => {
  const { loading, error } = useProject();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (projectId: string) => {
    setDeletingId(projectId);
    try {
      onDeleteProject(projectId);
    } catch (err) {
      console.error('删除项目失败:', err);
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="project-list-loading">加载中...</div>;
  }

  if (error) {
    return <div className="project-list-error">错误: {error}</div>;
  }

  if (projects.length === 0) {
    return <div className="project-list-empty">暂无项目</div>;
  }

  return (
    <div className="project-list">
      {projects.map((project) => (
        <div
          key={project.id}
          className={`project-card ${isCurrentProject(project.id) ? 'current' : ''}`}
        >
          <div className="project-header">
            <h3 className="project-name">{project.name}</h3>
            {project.is_default && (
              <span className="project-badge default">默认</span>
            )}
          </div>

          <div className="project-info">
            <p className="project-env">
              环境: {project.env_id}
            </p>
            <p className="project-path">
              路径: {project.path}
            </p>
          </div>

          <div className="project-actions">
            <button
              className={`select-button ${isCurrentProject(project.id) ? 'current' : ''}`}
              onClick={() => onSelectProject(project.id)}
              disabled={isCurrentProject(project.id)}
            >
              {isCurrentProject(project.id) ? '当前项目' : '选择'}
            </button>

            <button
              className="delete-button"
              onClick={() => handleDelete(project.id)}
              disabled={project.is_default || deletingId === project.id}
            >
              {project.is_default ? '不可删除' : '删除'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
