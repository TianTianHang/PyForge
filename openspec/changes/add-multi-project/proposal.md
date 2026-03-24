## Why

当前 PyForge 只有一个共享项目目录 `~/.pyforge/projects/`，所有 notebook 混在一起。用户无法：

1. **隔离项目**：数据分析和机器学习的 notebook 在同一个目录，容易混淆
2. **绑定环境**：每个项目应该关联特定的 Python 环境，但目前启动 Jupyter 时没有项目概念
3. **切换项目**：用户需要在不同项目间切换，每次打开对应的 notebook 目录和环境
4. **新建项目**：无法从零创建一个独立的新项目

随着多环境管理（`add-multi-env-management`）基本完成，项目管理是自然的下一步——环境和项目是一对一绑定关系。

## What Changes

### 新增能力

**1. 项目生命周期管理**
- 创建项目（指定名称、绑定环境）
- 删除项目（保留默认项目）
- 项目列表展示
- 项目-环境一对一绑定

**2. 项目级 Jupyter 启动**
- 启动 Jupyter 时传入 `project_id`
- `--notebook-dir` 指向项目目录
- Jupyter 可执行文件来自项目绑定的环境

**3. 启动流程变更**
- 新增 `select_project` 和 `no_project` 状态
- 启动顺序：检查环境 → 加载项目 → 选择/创建项目 → 启动 Jupyter
- 取消原来直接进入环境选择面板的流程

**4. 已有用户迁移**
- 检测 `~/.pyforge/projects/` 有 notebook 但无项目元数据
- 自动创建「我的项目」绑定 default 环境

### 新增 Tauri 命令

- `create_project` - 创建新项目
- `list_projects` - 获取项目列表
- `delete_project` - 删除项目
- `start_jupyter(project_id)` - 按项目启动 Jupyter（修改现有命令签名）

### 修改现有能力

**数据模型扩展**
- 新增 `Project` 模型（id, name, env_id, path, created_at）
- 新增 `ProjectsMetadata` 模型
- 扩展 `AppState` 包含项目列表和当前项目

**前端状态机变更**
- 新增 `"select_project"` 和 `"no_project"` 状态
- 启动流程从「选环境→进 Jupyter」变为「选项目→进 Jupyter」

## Capabilities

### New Capabilities

- `multi-project-management`: 项目创建、删除、列表、环境绑定、Jupyter 按项目启动

### Modified Capabilities

（无已有 spec，无需修改）

## Impact

### 受影响代码

- `src-tauri/src/models/` — 新增 Project 模型
- `src-tauri/src/domain/` — 新增 project 模块（creator/lister/deleter）
- `src-tauri/src/api/` — 新增 project_commands.rs，修改 jupyter_commands.rs
- `src-tauri/src/infrastructure/` — 新增 project 元数据 load/save，paths 扩展
- `src-tauri/src/lib.rs` — 注册新命令，修改启动流程
- `src/App.tsx` — 新状态和组件渲染
- `src/hooks/` — 新增 useProject，修改 useJupyter
- `src/components/` — 新增 ProjectPanel/ProjectList/CreateProjectDialog
- `src/types/index.ts` — 新增 Project 类型，扩展 AppState

### Migration

- 旧 `~/.pyforge/projects/` → 自动创建「我的项目」元数据
- 目录结构不变，只新增 `.projects-metadata.json`

## Out of Scope

- **多实例 Jupyter**：同时运行多个项目的 Jupyter（单实例切换）
- **项目导入导出**：zip 打包/解包（后续版本）
- **项目重命名**：后续版本实现
- **项目-环境多对一**：一个环境服务多个项目（已选择一对一绑定）
- **项目排序和搜索**：后续版本实现
