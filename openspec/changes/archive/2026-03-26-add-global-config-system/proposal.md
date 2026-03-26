## Why

PyForge 当前的配置（PyPI 源、Python 安装源、端口范围等）硬编码在代码中，用户无法自定义。随着用户基数增长和不同地区网络环境差异，需要一个灵活的全局配置系统来支持用户自定义源配置。

## What Changes

- 新增 `~/.pyforge/config.toml` 配置文件
- 新增 `~/.pyforge/uv.toml` 配置文件（由 PyForge 自动生成）
- 支持配置 PyPI 镜像源
- 支持配置 Python 安装镜像源 (`python-install-mirror`)
- 支持配置 Python 下载策略 (`automatic`/`manual`/`never`)
- 支持配置应用数据目录
- 支持配置默认 Python 版本
- 支持配置 Jupyter 端口范围和超时时间
- 支持配置默认安装包列表
- 所有 uv 命令使用 `--config-file` 参数指定配置文件
- 移除所有硬编码配置（`PYPI_MIRROR_URL`、`DEFAULT_PYTHON_VERSION` 等）
- 改造路径管理，从配置文件读取数据目录

## Capabilities

### New Capabilities
- `global-config`: 全局配置系统，支持配置文件的加载、保存和管理
- `uv-config`: uv 配置文件生成，将用户配置转换为 uv.toml 格式
- `path-management`: 路径管理改造，从配置文件读取数据目录

### Modified Capabilities
- `environment-creator`: 环境创建逻辑，移除硬编码配置，从配置文件读取
- `package-manager`: 包管理逻辑，移除硬编码配置，从配置文件读取
- `jupyter-base-env`: Jupyter 基础环境，移除硬编码配置，从配置文件读取

## Impact

- 新增依赖：`toml` crate（用于解析和生成 TOML 文件）
- 修改文件：
  - `src-tauri/src/models/config.rs`（新增）
  - `src-tauri/src/infrastructure/config.rs`（新增）
  - `src-tauri/src/infrastructure/uv_config.rs`（新增）
  - `src-tauri/src/api/config_commands.rs`（新增）
  - `src-tauri/src/models/mod.rs`（修改）
  - `src-tauri/src/infrastructure/mod.rs`（修改）
  - `src-tauri/src/infrastructure/paths.rs`（修改）
  - `src-tauri/src/infrastructure/constants.rs`（修改）
  - `src-tauri/src/infrastructure/uv.rs`（修改）
  - `src-tauri/src/api/mod.rs`（修改）
  - `src-tauri/src/lib.rs`（修改）
  - `src-tauri/src/domain/environment/creator.rs`（修改）
  - `src-tauri/src/domain/environment/package_manager.rs`（修改）
  - `src-tauri/src/domain/jupyter/base_env.rs`（修改）
