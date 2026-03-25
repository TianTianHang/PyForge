## Why

当前每个新环境都会安装 JupyterLab，导致环境体积膨胀且重复维护。引入独立的 base 环境集中提供 JupyterLab，并将内核与项目解耦，能降低环境创建成本并简化前端升级路径。

## What Changes

- 新增 `~/.pyforge/base` 作为全局 JupyterLab 运行环境，仅此处安装 JupyterLab。
- 默认环境与新建环境的包清单移除 JupyterLab，仅保留科学包与 ipykernel。
- 内核注册改为写入 `~/.pyforge/kernels/`，不再使用 `--user` 目录。
- 项目目录下新增 `kernels/` 链接区，将所需内核以链接方式暴露给项目。
- Jupyter 启动逻辑改为固定使用 base 环境的 JupyterLab，并配置 kernel_dirs。
- **Out of scope**：历史迁移、项目打包/导出、旧环境清理。

## Capabilities

### New Capabilities
- `base-jupyterlab-runtime`: 创建并维护全局 base 环境，所有 JupyterLab 前端统一由此启动。
- `kernel-store-and-linking`: 内核规格集中存储并通过项目内链接暴露给 Jupyter。

### Modified Capabilities
- `environment-default-packages`: 默认环境与新建环境的基础包清单去除 JupyterLab。

## Impact

- Rust 后端：环境创建/内核注册/Jupyter 启动/项目链接逻辑需要调整。
- 文件结构：新增 `~/.pyforge/base` 与 `~/.pyforge/kernels`。
- 启动流程：JupyterLab 可执行路径改为 base 环境。
- 文档：架构与目录结构说明需更新。
