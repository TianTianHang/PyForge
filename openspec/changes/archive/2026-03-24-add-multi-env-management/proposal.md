## Why

当前 PyForge MVP 只支持单一 Python 环境，所有项目共享同一个环境。这导致几个问题：

1. **灵活性不足**：不同项目可能需要不同的 Python 版本和包组合
2. **依赖冲突**：数据分析项目和机器学习项目可能需要不同版本的库
3. **学习体验差**：用户无法体验 Python 虚拟环境的概念和优势
4. **扩展性差**：后续功能（如项目导入导出）需要环境绑定机制

随着 MVP 完成并准备进入第二阶段开发，多环境管理是基础能力，需要优先实现。

## What Changes

### 新增能力

**1. 环境生命周期管理**
- 创建环境（指定名称、Python 版本、预装包）
- 删除环境（默认环境不可删除）
- 环境列表展示和详情查看

**2. 包管理**
- 查看已安装包列表
- 安装包（通过 uv）
- 卸载包

**3. Jupyter 内核管理**
- 创建环境时自动注册 Jupyter 内核
- 删除环境时自动注销内核
- 内核命名规范：`pyforge-{env-name}`

**4. 项目-环境绑定**
- 项目可选择绑定到某个环境
- 启动 Jupyter 时自动使用绑定环境的内核

### 修改现有能力

**目录结构变更**
```
~/.pyforge/
├── envs/                  # 从 env/ 改为 envs/（多环境）
│   ├── default/           # 默认环境（不可删除）
│   └── {env-name}/        # 用户创建的环境
├── projects/              # 从 project/ 改为 projects/（多项目）
│   ├── .metadata/         # 项目元数据
│   └── {project-name}/    # 项目目录
└── .envs-metadata.json    # 环境元数据索引
```

**数据模型扩展**
- 新增 `Environment` 模型
- 新增 `InstalledPackage` 模型
- 扩展 `AppState` 包含环境列表和当前环境

**新增 Tauri 命令**
- `list_environments` - 获取所有环境列表
- `create_environment` - 创建新环境
- `delete_environment` - 删除环境
- `list_packages` - 获取环境的包列表
- `install_package` - 安装包
- `uninstall_package` - 卸载包

## Capabilities

### New Capabilities

**环境管理**
- 用户可以创建多个 Python 环境
- 用户可以为每个环境指定 Python 版本
- 用户可以删除不需要的环境（默认环境除外）
- 用户可以查看所有环境列表和详情

**包管理**
- 用户可以查看环境已安装的包
- 用户可以安装新包到指定环境
- 用户可以从环境卸载包

**内核切换**
- 用户可以在 JupyterLab 中切换不同环境的内核
- 切换内核后，新 Cell 使用新环境执行

### Modified Capabilities

**项目管理**
- 项目启动时需要选择或绑定环境
- 项目元数据包含绑定的环境 ID

## Impact

### Breaking Changes

**目录结构变更**（需要迁移逻辑）
- `~/.pyforge/env/` → `~/.pyforge/envs/default/`
- `~/.pyforge/project/` → `~/.pyforge/projects/`

**API 变更**
- `check_env` 命令返回值变更（从 `EnvStatus` 变为 `Environment` 列表）
- `create_env` 命令参数变更（新增 name、python_version、packages 参数）

### Migration

需要实现自动迁移逻辑：
1. 检测旧目录结构（`~/.pyforge/env/`）
2. 迁移到新结构（`~/.pyforge/envs/default/`）
3. 创建默认环境元数据

## Out of Scope

- **环境克隆**：后续版本实现
- **环境模板**：后续版本实现
- **环境健康检测**：后续版本实现
- **环境版本管理**：后续版本实现
- **批量包管理**：后续版本实现
- **包依赖冲突检测**：后续版本实现
