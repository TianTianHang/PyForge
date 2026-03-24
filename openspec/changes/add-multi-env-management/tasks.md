# 多环境管理实现任务

## 阶段 1：数据模型和基础设施

### 任务 1.1：扩展 Rust 数据模型
- [ ] 在 `models/env.rs` 中添加 `Environment` 结构体
- [ ] 在 `models/env.rs` 中添加 `InstalledPackage` 结构体
- [ ] 在 `models/env.rs` 中添加 `EnvsMetadata` 结构体
- [ ] 更新 `models/mod.rs` 导出新类型

### 任务 1.2：扩展路径管理
- [ ] 在 `infrastructure/paths.rs` 中添加 `get_envs_dir()` 函数
- [ ] 在 `infrastructure/paths.rs` 中添加 `get_env_dir(env_id)` 函数
- [ ] 在 `infrastructure/paths.rs` 中添加 `get_projects_dir()` 函数
- [ ] 在 `infrastructure/paths.rs` 中添加 `get_env_metadata_path()` 函数
- [ ] 更新现有路径函数使用新目录结构

### 任务 1.3：创建元数据管理模块
- [ ] 创建 `infrastructure/metadata.rs` 文件
- [ ] 实现 `load_envs_metadata()` 函数
- [ ] 实现 `save_envs_metadata()` 函数
- [ ] 更新 `infrastructure/mod.rs` 导出新模块

### 任务 1.4：实现迁移逻辑
- [ ] 创建 `infrastructure/migration.rs` 文件
- [ ] 实现 `migrate_from_mvp()` 函数
- [ ] 在应用启动时调用迁移逻辑

## 阶段 2：环境管理核心功能

### 任务 2.1：重构环境创建逻辑
- [ ] 修改 `domain/environment/creator.rs` 支持指定名称和 Python 版本
- [ ] 修改 `create_default_environment()` 为 `create_environment()`
- [ ] 支持自定义预装包列表
- [ ] 更新进度事件支持多环境创建

### 任务 2.2：实现环境删除逻辑
- [ ] 创建 `domain/environment/deleter.rs` 文件
- [ ] 实现 `delete_environment()` 函数
- [ ] 添加默认环境保护检查
- [ ] 实现环境目录删除

### 任务 2.3：实现环境列表管理
- [ ] 创建 `domain/environment/lister.rs` 文件
- [ ] 实现 `list_environments()` 函数
- [ ] 实现环境存在性验证

### 任务 2.4：扩展内核管理
- [ ] 修改 `domain/environment/kernel.rs` 支持多环境
- [ ] 实现 `register_kernel(env_id)` 函数
- [ ] 实现 `unregister_kernel(env_id)` 函数
- [ ] 更新内核命名规范

### 任务 2.5：更新领域模块导出
- [ ] 更新 `domain/environment/mod.rs` 导出新模块

## 阶段 3：包管理功能

### 任务 3.1：实现包列表功能
- [ ] 创建 `domain/environment/package_manager.rs` 文件
- [ ] 实现 `list_packages(env_id)` 函数
- [ ] 解析 `uv pip list` 输出

### 任务 3.2：实现包安装功能
- [ ] 实现 `install_package(env_id, package_name)` 函数
- [ ] 添加进度事件支持
- [ ] 处理安装错误

### 任务 3.3：实现包卸载功能
- [ ] 实现 `uninstall_package(env_id, package_name)` 函数
- [ ] 处理卸载错误

## 阶段 4：Tauri 命令层

### 任务 4.1：扩展环境管理命令
- [ ] 在 `api/env_commands.rs` 中添加 `list_environments` 命令
- [ ] 在 `api/env_commands.rs` 中添加 `create_environment` 命令
- [ ] 在 `api/env_commands.rs` 中添加 `delete_environment` 命令
- [ ] 修改现有 `check_env` 命令返回多环境信息

### 任务 4.2：添加包管理命令
- [ ] 在 `api/env_commands.rs` 中添加 `list_packages` 命令
- [ ] 在 `api/env_commands.rs` 中添加 `install_package` 命令
- [ ] 在 `api/env_commands.rs` 中添加 `uninstall_package` 命令

### 任务 4.3：修改 Jupyter 命令
- [ ] 修改 `api/jupyter_commands.rs` 中的 `start_jupyter` 命令
- [ ] 添加 `env_id` 参数支持
- [ ] 使用指定环境的 Python 和内核

### 任务 4.4：更新命令注册
- [ ] 更新 `lib.rs` 注册所有新命令
- [ ] 更新 `api/mod.rs` 导出新命令

## 阶段 5：前端模型和状态

### 任务 5.1：扩展 TypeScript 类型
- [ ] 在 `types/index.ts` 中添加 `Environment` 接口
- [ ] 在 `types/index.ts` 中添加 `InstalledPackage` 接口

### 任务 5.2：扩展应用状态
- [ ] 修改 `App.tsx` 添加环境列表状态
- [ ] 修改 `App.tsx` 添加当前环境状态

## 阶段 6：前端组件

### 任务 6.1：创建环境管理面板
- [ ] 创建 `components/EnvironmentPanel.tsx`
- [ ] 创建 `components/EnvironmentList.tsx`
- [ ] 创建 `components/CreateEnvironmentDialog.tsx`
- [ ] 创建 `components/EnvironmentDetail.tsx`

### 任务 6.2：创建包管理组件
- [ ] 创建 `components/PackageList.tsx`
- [ ] 创建 `components/InstallPackageInput.tsx`

### 任务 6.3：更新环境 Hook
- [ ] 修改 `hooks/useEnvironment.ts` 支持多环境
- [ ] 添加 `listEnvironments` 功能
- [ ] 添加 `createEnvironment` 功能
- [ ] 添加 `deleteEnvironment` 功能

### 任务 6.4：创建包管理 Hook
- [ ] 创建 `hooks/usePackageManager.ts`
- [ ] 实现 `listPackages` 功能
- [ ] 实现 `installPackage` 功能
- [ ] 实现 `uninstallPackage` 功能

## 阶段 7：集成和测试

### 任务 7.1：更新主应用流程
- [ ] 修改 `App.tsx` 集成环境管理面板
- [ ] 更新启动流程支持多环境
- [ ] 更新错误处理

### 任务 7.2：更新 JupyterViewer
- [ ] 修改 `components/JupyterViewer.tsx` 支持环境切换
- [ ] 添加环境信息显示

### 任务 7.3：测试
- [ ] 测试环境创建流程
- [ ] 测试环境删除流程
- [ ] 测试包管理流程
- [ ] 测试迁移逻辑
- [ ] 测试前端组件

## 依赖关系

```
阶段 1 ─────────────────────────────────────────────────────────▶
  │
  │   阶段 2 ──────────────────────────────────────────────────▶
  │     │
  │     │   阶段 3 ────────────────────────────────────────────▶
  │     │     │
  │     │     │   阶段 4 ──────────────────────────────────────▶
  │     │     │     │
  │     │     │     │   阶段 5 ────────────────────────────────▶
  │     │     │     │     │
  │     │     │     │     │   阶段 6 ──────────────────────────▶
  │     │     │     │     │     │
  │     │     │     │     │     │   阶段 7 ────────────────────▶
  ▼     ▼     ▼     ▼     ▼     ▼     ▼
  数据模型 → 环境管理 → 包管理 → 命令层 → 前端模型 → 前端组件 → 集成测试
```
