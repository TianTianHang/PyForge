import React, { useState, useEffect } from 'react';
import { Project, KernelBindingInfo } from '../types';
import { useKernelBinding } from '../hooks/useKernelBinding';

interface ProjectSettingsProps {
  project: Project;
  onClose: () => void;
  onDeleteProject?: (projectId: string) => void;
  onCreateEnvironment?: (name: string, pythonVersion: string, packages: string[], projectId?: string | null) => void;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  project,
  onClose,
  onDeleteProject,
  onCreateEnvironment,
}) => {
  const {
    loading: kernelLoading,
    error: kernelError,
    bindKernel,
    unbindKernel,
    listProjectKernels,
    listUnboundKernels,
  } = useKernelBinding();

  const [boundKernels, setBoundKernels] = useState<KernelBindingInfo[]>([]);
  const [unboundKernels, setUnboundKernels] = useState<KernelBindingInfo[]>([]);
  const [selectedUnboundKernel, setSelectedUnboundKernel] = useState<string>('');
  const [newEnvName, setNewEnvName] = useState('');
  const [selectedNewEnvPython, setSelectedNewEnvPython] = useState('3.12');
  const [newEnvPackages, setNewEnvPackages] = useState('');
  const [tab, setTab] = useState<'kernels' | 'environments' | 'delete'>('kernels');

  const [isCreatingEnv, setIsCreatingEnv] = useState(false);
  const [createEnvError, setCreateEnvError] = useState<string | null>(null);
  const [createEnvSuccess, setCreateEnvSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadKernels();
  }, [project.id]);

  const loadKernels = async () => {
    try {
      const [bound, unbound] = await Promise.all([
        listProjectKernels(project.id),
        listUnboundKernels(project.id),
      ]);
      setBoundKernels(bound);
      setUnboundKernels(unbound);
    } catch (err) {
      console.error('加载内核列表失败:', err);
    }
  };

  const handleBindKernel = async () => {
    if (!selectedUnboundKernel) return;

    try {
      await bindKernel(project.id, selectedUnboundKernel);
      setSelectedUnboundKernel('');
      await loadKernels();
    } catch (err) {
      console.error('绑定内核失败:', err);
    }
  };

  const handleUnbindKernel = async (envId: string) => {
    try {
      await unbindKernel(project.id, envId);
      await loadKernels();
    } catch (err) {
      console.error('解绑内核失败:', err);
    }
  };

  const handleCreateNewEnv = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!onCreateEnvironment) {
      setCreateEnvError("创建环境功能不可用");
      return;
    }

    setCreateEnvError(null);
    setCreateEnvSuccess(null);
    setIsCreatingEnv(true);

    try {
      const packages = newEnvPackages
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      await onCreateEnvironment(newEnvName, selectedNewEnvPython, packages, project.id);

      setCreateEnvSuccess(`环境 "${newEnvName}" 创建并绑定成功！`);

      setNewEnvName('');
      setSelectedNewEnvPython('3.12');
      setNewEnvPackages('');

      setTimeout(async () => {
        await loadKernels();
        setCreateEnvSuccess(null);
      }, 2000);

    } catch (err) {
      setCreateEnvError(`创建失败: ${err}`);
    } finally {
      setIsCreatingEnv(false);
    }
  };

  const handleDeleteProject = () => {
    if (onDeleteProject) {
      onDeleteProject(project.id);
    }
    onClose();
  };

  const renderKernelsTab = () => (
    <div className="p-4">
      <h4 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">绑定内核</h4>
      <div className="flex flex-col gap-2">
        {boundKernels.length > 0 ? (
          boundKernels.map((kernel) => (
            <div key={kernel.env_id} className="flex justify-between items-center p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-tertiary)]">
              <span className="font-medium text-[var(--color-text-primary)]">{kernel.kernel_name}</span>
              <button
                className="bg-[var(--color-warning)] hover:bg-[var(--color-warning)]/80 text-white border-none px-3 py-1.5 text-sm rounded cursor-pointer transition-all duration-200 press-scale"
                onClick={() => handleUnbindKernel(kernel.env_id)}
              >
                解绑
              </button>
            </div>
          ))
        ) : (
          <p className="text-[var(--color-text-tertiary)] text-center py-4">暂无绑定的内核</p>
        )}
      </div>

      <h4 className="text-base font-semibold text-[var(--color-text-primary)] mt-6 mb-3">添加内核</h4>
      {kernelError && <div className="bg-[var(--color-error-muted)] text-[var(--color-error)] px-4 py-3 rounded-lg border border-[var(--color-error)]/20 mb-3">{kernelError}</div>}
      <div className="flex gap-2">
        <select
          value={selectedUnboundKernel}
          onChange={(e) => setSelectedUnboundKernel(e.target.value)}
          className="flex-1 px-3 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-base focus:outline-none focus:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] appearance-none"
        >
          <option value="" className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">选择要添加的内核</option>
          {unboundKernels.map((kernel) => (
            <option key={kernel.env_id} value={kernel.env_id} className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
              {kernel.kernel_name}
            </option>
          ))}
        </select>
        <button
          onClick={handleBindKernel}
          disabled={!selectedUnboundKernel || kernelLoading}
          className="bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white border-none px-4 py-2 text-sm rounded-lg cursor-pointer transition-all duration-200 press-scale hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          添加
        </button>
      </div>
    </div>
  );

  const renderEnvironmentsTab = () => (
    <div className="p-4">
      <h4 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">在项目中创建新环境</h4>
      <form onSubmit={handleCreateNewEnv}>
        <div className="mb-4">
          <label className="block mb-2 font-medium text-[var(--color-text-primary)]">环境名称</label>
          <input
            type="text"
            value={newEnvName}
            onChange={(e) => setNewEnvName(e.target.value)}
            placeholder="输入环境名称..."
            required
            disabled={isCreatingEnv}
            className="w-full px-3 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-base focus:outline-none focus:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] disabled:opacity-50"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium text-[var(--color-text-primary)]">Python 版本</label>
          <select
            value={selectedNewEnvPython}
            onChange={(e) => setSelectedNewEnvPython(e.target.value)}
            disabled={isCreatingEnv}
            className="w-full px-3 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-base focus:outline-none focus:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] appearance-none disabled:opacity-50"
          >
            <option value="3.12" className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">3.12</option>
            <option value="3.11" className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">3.11</option>
            <option value="3.10" className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">3.10</option>
            <option value="3.9" className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">3.9</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium text-[var(--color-text-primary)]">安装的包（可选）</label>
          <textarea
            value={newEnvPackages}
            onChange={(e) => setNewEnvPackages(e.target.value)}
            placeholder="用逗号分隔包名，如：numpy, pandas, matplotlib"
            disabled={isCreatingEnv}
            className="w-full px-3 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-base min-h-20 resize-y focus:outline-none focus:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] disabled:opacity-50"
          />
        </div>

        {createEnvError && (
          <div className="mt-2.5 p-2.5 bg-[var(--color-error-muted)] text-[var(--color-error)] border border-[var(--color-error)]/20 rounded">
            {createEnvError}
          </div>
        )}
        {createEnvSuccess && (
          <div className="mt-2.5 p-2.5 bg-[var(--color-success-muted)] text-[var(--color-success)] border border-[var(--color-success)]/20 rounded">
            {createEnvSuccess}
          </div>
        )}

        <button
          type="submit"
          disabled={isCreatingEnv || !newEnvName.trim()}
          className="mt-4 w-full bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white border-none px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-all duration-200 press-scale hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingEnv ? '创建中...' : '创建环境并自动绑定'}
        </button>
      </form>
    </div>
  );

  const renderDeleteTab = () => (
    <div className="p-4">
      <div className="bg-[var(--color-error-muted)] border border-[var(--color-error)]/20 rounded-lg p-4 mb-4">
        <h4 className="text-base font-semibold text-[var(--color-error)] mb-2">警告</h4>
        <p className="text-[var(--color-text-secondary)] mb-2">删除项目将永久删除项目及其所有内容，包括：</p>
        <ul className="list-disc list-inside text-[var(--color-text-secondary)] mb-2">
          <li>项目目录下的所有文件</li>
          <li>该项目的内核绑定</li>
        </ul>
        <p className="text-[var(--color-text-secondary)]">此操作<strong>无法撤销</strong>。</p>
      </div>
      <button
        className="w-full bg-[var(--color-error)] hover:bg-[var(--color-error)]/80 text-white border-none px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-all duration-200 press-scale disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleDeleteProject}
        disabled={project.is_default}
      >
        {project.is_default ? '默认项目不可删除' : '删除项目'}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-[var(--color-bg-primary)] rounded-xl shadow-lg w-[90%] max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-dialog-enter" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-border)]">
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] m-0">项目设置</h3>
          <button
            className="bg-none border-none text-2xl text-[var(--color-text-tertiary)] w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] press-scale"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex border-b border-[var(--color-border)]">
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium border-none cursor-pointer transition-all duration-200 press-scale ${tab === 'kernels' ? 'text-[var(--color-accent-primary)] border-b-2 border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-tertiary)]'}`}
              onClick={() => setTab('kernels')}
            >
              内核管理
            </button>
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium border-none cursor-pointer transition-all duration-200 press-scale ${tab === 'environments' ? 'text-[var(--color-accent-primary)] border-b-2 border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-tertiary)]'}`}
              onClick={() => setTab('environments')}
            >
              环境管理
            </button>
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium border-none cursor-pointer transition-all duration-200 press-scale ${tab === 'delete' ? 'text-[var(--color-error)] border-b-2 border-[var(--color-error)] bg-[var(--color-error)]/10' : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-tertiary)]'}`}
              onClick={() => setTab('delete')}
            >
              删除项目
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === 'kernels' && renderKernelsTab()}
            {tab === 'environments' && renderEnvironmentsTab()}
            {tab === 'delete' && renderDeleteTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;
