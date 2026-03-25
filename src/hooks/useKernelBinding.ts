import { useCallback, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { KernelBindingInfo } from '../types';

interface UseKernelBindingHook {
  loading: boolean;
  error: string | null;

  bindKernel: (projectId: string, envId: string) => Promise<void>;
  unbindKernel: (projectId: string, envId: string) => Promise<void>;
  listProjectKernels: (projectId: string) => Promise<KernelBindingInfo[]>;
  listUnboundKernels: (projectId: string) => Promise<KernelBindingInfo[]>;
}

export const useKernelBinding = (): UseKernelBindingHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bindKernel = useCallback(async (projectId: string, envId: string) => {
    setLoading(true);
    setError(null);

    try {
      await invoke('bind_kernel_command', { projectId, envId });
    } catch (err) {
      setError(err instanceof Error ? err.message : '绑定内核失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const unbindKernel = useCallback(async (projectId: string, envId: string) => {
    setLoading(true);
    setError(null);

    try {
      await invoke('unbind_kernel_command', { projectId, envId });
    } catch (err) {
      setError(err instanceof Error ? err.message : '解绑内核失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listProjectKernels = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      const envIds = await invoke<string[]>('list_project_kernels_command', { projectId });

      // Convert env IDs to KernelBindingInfo format
      // Backend returns env IDs bound to this project, we construct the full info
      const bindings: KernelBindingInfo[] = envIds.map(envId => ({
        env_id: envId,
        kernel_name: `pyforge-${envId}`,
        bound_to_projects: [projectId], // Currently simplified: assumes kernel is bound only to this project
      }));

      return bindings;
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取项目内核列表失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listUnboundKernels = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      const envIds = await invoke<string[]>('list_unbound_kernels_command', { projectId });

      // Convert env IDs to KernelBindingInfo format
      const bindings: KernelBindingInfo[] = envIds.map(envId => ({
        env_id: envId,
        kernel_name: `pyforge-${envId}`,
        bound_to_projects: [], // These are unbound, so empty array
      }));

      return bindings;
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取未绑定内核列表失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    bindKernel,
    unbindKernel,
    listProjectKernels,
    listUnboundKernels,
  };
};
