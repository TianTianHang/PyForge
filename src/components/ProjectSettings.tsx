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
      <h4 className="text-base font-semibold text-slate-800 mb-3">绑定内核</h4>
      <div className="flex flex-col gap-2">
        {boundKernels.length > 0 ? (
          boundKernels.map((kernel) => (
            <div key={kernel.env_id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg bg-slate-50">
              <span className="font-medium text-slate-800">{kernel.kernel_name}</span>
              <button
                className="bg-amber-500 hover:bg-amber-600 text-white border-none px-3 py-1.5 text-sm rounded cursor-pointer transition-colors"
                onClick={() => handleUnbindKernel(kernel.env_id)}
              >
                解绑
              </button>
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-center py-4">暂无绑定的内核</p>
        )}
      </div>

      <h4 className="text-base font-semibold text-slate-800 mt-6 mb-3">添加内核</h4>
      {kernelError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 mb-3">{kernelError}</div>}
      <div className="flex gap-2">
        <select
          value={selectedUnboundKernel}
          onChange={(e) => setSelectedUnboundKernel(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-base focus:outline-none focus:border-blue-500"
        >
          <option value="">选择要添加的内核</option>
          {unboundKernels.map((kernel) => (
            <option key={kernel.env_id} value={kernel.env_id}>
              {kernel.kernel_name}
            </option>
          ))}
        </select>
        <button
          onClick={handleBindKernel}
          disabled={!selectedUnboundKernel || kernelLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white border-none px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          添加
        </button>
      </div>
    </div>
  );

  const renderEnvironmentsTab = () => (
    <div className="p-4">
      <h4 className="text-base font-semibold text-slate-800 mb-3">在项目中创建新环境</h4>
      <form onSubmit={handleCreateNewEnv}>
        <div className="mb-4">
          <label className="block mb-2 font-medium text-slate-800">环境名称</label>
          <input
            type="text"
            value={newEnvName}
            onChange={(e) => setNewEnvName(e.target.value)}
            placeholder="输入环境名称..."
            required
            disabled={isCreatingEnv}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium text-slate-800">Python 版本</label>
          <select
            value={selectedNewEnvPython}
            onChange={(e) => setSelectedNewEnvPython(e.target.value)}
            disabled={isCreatingEnv}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base focus:outline-none focus:border-blue-500 disabled:opacity-50"
          >
            <option value="3.12">3.12</option>
            <option value="3.11">3.11</option>
            <option value="3.10">3.10</option>
            <option value="3.9">3.9</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium text-slate-800">安装的包（可选）</label>
          <textarea
            value={newEnvPackages}
            onChange={(e) => setNewEnvPackages(e.target.value)}
            placeholder="用逗号分隔包名，如：numpy, pandas, matplotlib"
            disabled={isCreatingEnv}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base min-h-20 resize-y focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        {createEnvError && (
          <div className="mt-2.5 p-2.5 bg-red-50 text-red-600 border border-red-300 rounded">
            {createEnvError}
          </div>
        )}
        {createEnvSuccess && (
          <div className="mt-2.5 p-2.5 bg-green-50 text-green-600 border border-green-300 rounded">
            {createEnvSuccess}
          </div>
        )}

        <button
          type="submit"
          disabled={isCreatingEnv || !newEnvName.trim()}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white border-none px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingEnv ? '创建中...' : '创建环境并自动绑定'}
        </button>
      </form>
    </div>
  );

  const renderDeleteTab = () => (
    <div className="p-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <h4 className="text-base font-semibold text-red-600 mb-2">警告</h4>
        <p className="text-slate-600 mb-2">删除项目将永久删除项目及其所有内容，包括：</p>
        <ul className="list-disc list-inside text-slate-600 mb-2">
          <li>项目目录下的所有文件</li>
          <li>该项目的内核绑定</li>
        </ul>
        <p className="text-slate-600">此操作<strong>无法撤销</strong>。</p>
      </div>
      <button
        className="w-full bg-red-500 hover:bg-red-600 text-white border-none px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleDeleteProject}
        disabled={project.is_default}
      >
        {project.is_default ? '默认项目不可删除' : '删除项目'}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800 m-0">项目设置</h3>
          <button
            className="bg-none border-none text-2xl text-slate-400 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium border-none cursor-pointer transition-colors ${tab === 'kernels' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 bg-white hover:bg-slate-50'}`}
              onClick={() => setTab('kernels')}
            >
              内核管理
            </button>
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium border-none cursor-pointer transition-colors ${tab === 'environments' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 bg-white hover:bg-slate-50'}`}
              onClick={() => setTab('environments')}
            >
              环境管理
            </button>
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium border-none cursor-pointer transition-colors ${tab === 'delete' ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-slate-500 bg-white hover:bg-slate-50'}`}
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
