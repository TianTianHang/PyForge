import { useCallback, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Project } from '../types';

interface UseProjectHook {
  projects: Project[];
  loading: boolean;
  error: string | null;

  createProject: (name: string, envId: string) => Promise<void>;
  listProjects: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
}

export const useProject = (): UseProjectHook => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = useCallback(async (name: string, envId: string) => {
    setLoading(true);
    setError(null);

    try {
      await invoke('create_project_command', { name, envId });
      await listProjects(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建项目失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await invoke<Project[]>('list_projects_command');
      setProjects(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取项目列表失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      await invoke('delete_project_command', { projectId });
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除项目失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    projects,
    loading,
    error,
    createProject,
    listProjects,
    deleteProject,
  };
};
