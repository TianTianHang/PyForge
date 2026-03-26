import React, { useState, useEffect } from 'react';
import { Project, Environment, UserMode } from '../types';
import ProjectList from './ProjectList';
import CreateProjectDialog from './CreateProjectDialog';
import { ThemeToggle } from './ThemeToggle';
import WelcomeGuide from './WelcomeGuide';

const FIRST_TIME_VISIT_KEY = 'pyforge_first_time_visit';

/**
 * Calculate user experience mode based on project count and visit history
 * Implements progressive disclosure by showing different UI based on user expertise
 * @param projectCount - Number of projects the user has created
 * @param hasVisitedBefore - Whether user has visited before (from localStorage)
 * @returns The appropriate user mode for the current user
 */
const calculateUserMode = (projectCount: number, hasVisitedBefore: boolean): UserMode => {
  if (projectCount === 0 && !hasVisitedBefore) {
    return 'first-time';
  }
  if (projectCount < 4) {
    return 'beginner';
  }
  return 'standard';
};

interface ProjectPanelProps {
  projects: Project[];
  environments: Environment[];
  currentProjectId: string | null;
  onCreateProject: (name: string, envId: string) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onSelectProject: (projectId: string | null) => void;
  onStartJupyter: (projectId: string) => void;
  onOpenSettings: (projectId: string) => void;
  onCreateEnvironment?: () => void;
  onOpenAppSettings?: () => void;
  startingProjectId?: string | null;
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
  onOpenAppSettings,
  startingProjectId,
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [userMode, setUserMode] = useState<UserMode>('first-time');
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem(FIRST_TIME_VISIT_KEY) === 'true';
    setHasVisitedBefore(visited);
    const mode = calculateUserMode(projects.length, visited);
    setUserMode(mode);
  }, [projects.length]);

  const handleClickOutside = () => {
    onSelectProject(null);
  };

  const handleCreateProject = async (name: string, envId: string) => {
    try {
      await onCreateProject(name, envId);
      if (!hasVisitedBefore) {
        localStorage.setItem(FIRST_TIME_VISIT_KEY, 'true');
        setHasVisitedBefore(true);
      }
      setShowCreateDialog(false);
    } catch (err) {
      console.error('创建项目失败:', err);
    }
  };

  const handleSelectProject = (projectId: string) => {
    onSelectProject(projectId);
  };

  const isCurrentProject = (projectId: string) => {
    return currentProjectId === projectId;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] m-0">项目</h2>
          <span className="text-sm text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded">
            {projects.length}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] px-4 py-2 text-sm rounded-lg cursor-pointer transition-all border border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
            onClick={() => onOpenAppSettings?.()}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              设置
            </span>
          </button>
          <ThemeToggle />
          <button
            className="bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white border-none px-4 py-2 text-sm rounded-lg cursor-pointer transition-all shadow-md shadow-[var(--color-accent-glow)] hover:shadow-lg hover:scale-105"
            onClick={() => setShowCreateDialog(true)}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建项目
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4" onClick={handleClickOutside}>
        {projects.length > 0 ? (
          <ProjectList
            projects={projects}
            onSelectProject={handleSelectProject}
            onDeleteProject={onDeleteProject}
            onOpenSettings={onOpenSettings}
            onStartJupyter={onStartJupyter}
            isCurrentProject={isCurrentProject}
            userMode={userMode}
            startingProjectId={startingProjectId}
          />
        ) : (
          <WelcomeGuide />
        )}
      </div>

      {showCreateDialog && (
        <CreateProjectDialog
          projects={projects}
          environments={environments}
          onClose={() => {
            setShowCreateDialog(false);
          }}
          onConfirm={handleCreateProject}
          onCreateEnvironment={onCreateEnvironment}
        />
      )}
    </div>
  );
};

export default ProjectPanel;