import React, { useState } from 'react';
import { Project, UserMode } from '../types';
import { useProject } from '../hooks/useProject';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenSettings: (projectId: string) => void;
  onStartJupyter: (projectId: string) => void;
  isCurrentProject: (projectId: string) => boolean;
  userMode: UserMode;
  startingProjectId?: string | null;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onDeleteProject,
  onOpenSettings,
  onStartJupyter,
  isCurrentProject,
  userMode,
  startingProjectId,
}) => {
  // TODO: Use userMode for progressive disclosure (tasks 5.4, 5.5)
  void userMode;
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
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-[var(--color-text-tertiary)]">
          <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-accent-primary)] rounded-full animate-spin"></div>
          加载中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-[var(--color-error)]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          错误: {error}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-[var(--color-text-tertiary)]">
        暂无项目
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
      {projects.map((project) => {
        const isActive = isCurrentProject(project.id);

        return (
          <div
            key={project.id}
            className={`group flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
              isActive
                ? 'bg-[var(--color-bg-elevated)] border-[var(--color-border-hover)] shadow-lg'
                : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] hover:border-[var(--color-border-hover)]'
            }`}
            onClick={() => onOpenSettings(project.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive ? 'bg-[var(--color-accent-primary)]' : 'bg-[var(--color-bg-tertiary)] group-hover:bg-[var(--color-accent-primary)]'
                }`}>
                  <svg className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--color-text-tertiary)] group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h3 className={`font-semibold m-0 truncate ${isActive ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)]'}`}>
                  {project.name}
                </h3>
                {project.is_default && (
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-success-muted)] text-[var(--color-success)] border border-[var(--color-success)]/20">
                    默认
                  </span>
                )}
              </div>
              <div className="space-y-1 ml-10">
                <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  <span className="truncate">{project.env_id}</span>
                </p>
                <p className="text-sm text-[var(--color-text-tertiary)] flex items-center gap-2 font-mono">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="truncate">{project.path}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <button
                disabled={startingProjectId === project.id}
                className={`${
                  startingProjectId === project.id
                    ? 'bg-[var(--color-text-tertiary)] cursor-not-allowed opacity-60'
                    : 'bg-[var(--color-success)] hover:bg-[var(--color-success)]/80 cursor-pointer shadow-md'
                } text-white border-none px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5`}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartJupyter(project.id);
                }}
              >
                {startingProjectId === project.id ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    启动中...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    启动 Jupyter
                  </>
                )}
              </button>

              <button
                className="bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] px-3 py-1.5 text-sm rounded-lg cursor-pointer transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSettings(project.id);
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              <button
                className="bg-[var(--color-error-muted)] hover:bg-[var(--color-error)] text-[var(--color-error)] hover:text-white border border-[var(--color-error)]/20 hover:border-[var(--color-error)] px-3 py-1.5 text-sm rounded-lg cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-error-muted)] disabled:hover:text-[var(--color-error)]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(project.id);
                }}
                disabled={project.is_default || deletingId === project.id}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectList;