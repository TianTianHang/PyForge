import React, { useState, useEffect } from 'react';
import { Project, KernelBindingInfo } from '../types';
import { useKernelBinding } from '../hooks/useKernelBinding';
import './ProjectSettings.css';

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

  const handleCreateNewEnv = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreateEnvironment) {
      const packages = newEnvPackages
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      onCreateEnvironment(newEnvName, selectedNewEnvPython, packages, project.id);
    }
    setNewEnvName('');
    setSelectedNewEnvPython('3.12');
    setNewEnvPackages('');
  };

  const handleDeleteProject = () => {
    if (onDeleteProject) {
      onDeleteProject(project.id);
    }
    onClose();
  };

  const renderKernelsTab = () => (
    <div className="settings-tab-content">
      <h4>绑定内核</h4>
      <div className="kernels-list">
        {boundKernels.length > 0 ? (
          boundKernels.map((kernel) => (
            <div key={kernel.env_id} className="kernel-item">
              <span className="kernel-name">{kernel.kernel_name}</span>
              <button
                className="unbind-button"
                onClick={() => handleUnbindKernel(kernel.env_id)}
              >
                解绑
              </button>
            </div>
          ))
        ) : (
          <p className="no-kernels">暂无绑定的内核</p>
        )}
      </div>

      <h4>添加内核</h4>
      {kernelError && <div className="error-message">{kernelError}</div>}
      <div className="add-kernel">
        <select
          value={selectedUnboundKernel}
          onChange={(e) => setSelectedUnboundKernel(e.target.value)}
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
        >
          添加
        </button>
      </div>
    </div>
  );

  const renderEnvironmentsTab = () => (
    <div className="settings-tab-content">
      <h4>在项目中创建新环境</h4>
      <form onSubmit={handleCreateNewEnv} className="create-env-form">
        <div className="form-group">
          <label>环境名称</label>
          <input
            type="text"
            value={newEnvName}
            onChange={(e) => setNewEnvName(e.target.value)}
            placeholder="输入环境名称..."
            required
          />
        </div>
        <div className="form-group">
          <label>Python 版本</label>
          <select
            value={selectedNewEnvPython}
            onChange={(e) => setSelectedNewEnvPython(e.target.value)}
          >
            <option value="3.12">3.12</option>
            <option value="3.11">3.11</option>
            <option value="3.10">3.10</option>
            <option value="3.9">3.9</option>
          </select>
        </div>
        <div className="form-group">
          <label>安装的包（可选）</label>
          <textarea
            value={newEnvPackages}
            onChange={(e) => setNewEnvPackages(e.target.value)}
            placeholder="用逗号分隔包名，如：numpy, pandas, matplotlib"
          />
        </div>
        <button type="submit" className="create-env-button">
          创建环境并自动绑定
        </button>
      </form>
    </div>
  );

  const renderDeleteTab = () => (
    <div className="settings-tab-content delete-tab">
      <div className="delete-warning">
        <h4>警告</h4>
        <p>删除项目将永久删除项目及其所有内容，包括：</p>
        <ul>
          <li>项目目录下的所有文件</li>
          <li>该项目的内核绑定</li>
        </ul>
        <p>此操作<strong>无法撤销</strong>。</p>
      </div>
      <button
        className="delete-project-button"
        onClick={handleDeleteProject}
        disabled={project.is_default}
      >
        {project.is_default ? '默认项目不可删除' : '删除项目'}
      </button>
    </div>
  );

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>项目设置</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-body">
          <div className="settings-tabs">
            <button
              className={`tab-button ${tab === 'kernels' ? 'active' : ''}`}
              onClick={() => setTab('kernels')}
            >
              内核管理
            </button>
            <button
              className={`tab-button ${tab === 'environments' ? 'active' : ''}`}
              onClick={() => setTab('environments')}
            >
              环境管理
            </button>
            <button
              className={`tab-button ${tab === 'delete' ? 'active' : ''}`}
              onClick={() => setTab('delete')}
            >
              删除项目
            </button>
          </div>

          {tab === 'kernels' && renderKernelsTab()}
          {tab === 'environments' && renderEnvironmentsTab()}
          {tab === 'delete' && renderDeleteTab()}
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;