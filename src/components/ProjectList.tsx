import React, { useState } from 'react';
import { Project } from '../types';
import { useProject } from '../hooks/useProject';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenSettings: (projectId: string) => void;
  onStartJupyter: (projectId: string) => void;
  isCurrentProject: (projectId: string) => boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onSelectProject,
  onDeleteProject,
  onOpenSettings,
  onStartJupyter,
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
    return <div className="flex items-center justify-center py-8 text-slate-400">加载中...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center py-8 text-red-500">错误: {error}</div>;
  }

  if (projects.length === 0) {
    return <div className="flex items-center justify-center py-8 text-slate-400">暂无项目</div>;
  }

  return (
    <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
      {projects.map((project) => (
        <div
          key={project.id}
          className={`flex justify-between items-center p-4 border rounded-lg bg-white cursor-pointer transition-all hover:border-blue-500 hover:shadow-sm ${isCurrentProject(project.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
          onClick={() => onSelectProject(project.id)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-800 m-0">{project.name}</h3>
              {project.is_default && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500 text-white">默认</span>
              )}
            </div>
            <p className="text-sm text-slate-500 mb-0.5">环境: {project.env_id}</p>
            <p className="text-sm text-slate-400">路径: {project.path}</p>
          </div>

          <div className="flex gap-2">
            {isCurrentProject(project.id) && (
              <button
                className="bg-green-500 hover:bg-green-600 text-white border-none px-3 py-1.5 text-sm rounded cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartJupyter(project.id);
                }}
              >
                启动 Jupyter
              </button>
            )}

            <button
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border-none px-3 py-1.5 text-sm rounded cursor-pointer transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings(project.id);
              }}
            >
              设置
            </button>

            <button
              className="bg-red-500 hover:bg-red-600 text-white border-none px-3 py-1.5 text-sm rounded cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(project.id);
              }}
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
