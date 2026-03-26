## Why

当前 PyForge 直接调用系统 `uv` 命令（`Command::new("uv")`），要求用户预先安装 uv。这与"零配置"的产品目标矛盾：

1. **用户需要手动安装 uv** — 增加了使用门槛
2. **uv 版本不确定** — 不同用户可能使用不同版本，导致行为差异
3. **离线场景不可用** — 没有 uv 的机器无法运行 PyForge

目标：将 uv 作为 sidecar 捆绑到应用中，用户无需任何前置安装。

## What Changes

### 新增能力

**1. 捆绑 uv 二进制文件**
- 使用 Tauri 的 `externalBin` 机制将 uv 捆绑到应用包中
- 运行时通过 `tauri-plugin-shell` 的 sidecar API 调用

**2. 版本管理**
- 创建 `src-tauri/uv-version.txt` 文件固定 uv 版本（如 `0.11.1`）
- 构建时根据版本号下载对应平台的二进制

**3. 构建时下载**
- 创建跨平台构建脚本（`scripts/download-uv.sh` / `download-uv.ps1`）
- CI/CD 在构建前自动下载对应平台的 uv 二进制

### 修改现有能力

**Rust 代码调用方式变更**

将 7 处 `Command::new("uv")` 替换为 sidecar 调用：
- `src/domain/environment/package_manager.rs` — 3 处（list/install/uninstall packages）
- `src/domain/environment/creator.rs` — 2 处（create venv / install packages）
- `src/domain/jupyter/base_env.rs` — 2 处（create base venv / install JupyterLab）

**配置变更**
- `Cargo.toml` — 添加 `tauri-plugin-shell` 依赖
- `tauri.conf.json` — 添加 `bundle.externalBin: ["binaries/uv"]`
- `capabilities/default.json` — 添加 `shell:allow-execute` 权限

**CI/CD 变更**
- 修改 `.github/workflows/build.yml`：添加下载 uv 步骤，移除 macOS Intel 构建

## Capabilities

### New Capabilities

- `bundled-uv-sidecar`: 应用内置 uv 二进制，通过 sidecar 机制调用，无需用户安装

### Modified Capabilities

（无已有 spec，无需修改）

## Impact

### 受影响代码

- `src-tauri/Cargo.toml` — 添加 tauri-plugin-shell 依赖
- `src-tauri/tauri.conf.json` — 配置 externalBin
- `src-tauri/capabilities/default.json` — 添加 shell 权限
- `src-tauri/src/lib.rs` — 初始化 shell 插件
- `src-tauri/src/infrastructure/mod.rs` — 导出 uv 模块
- `src-tauri/src/infrastructure/uv.rs` — 新建，sidecar 路径管理
- `src-tauri/src/domain/environment/package_manager.rs` — 修改 3 处 uv 调用
- `src-tauri/src/domain/environment/creator.rs` — 修改 2 处 uv 调用
- `src-tauri/src/domain/jupyter/base_env.rs` — 修改 2 处 uv 调用
- `scripts/download-uv.sh` — 新建，Linux/macOS 构建脚本
- `scripts/download-uv.ps1` — 新建，Windows 构建脚本
- `.github/workflows/build.yml` — 添加下载步骤，移除 macOS Intel

### 新增文件

- `src-tauri/uv-version.txt` — uv 版本号
- `src-tauri/binaries/.gitkeep` — 占位（实际二进制构建时下载）
- `src-tauri/src/infrastructure/uv.rs`
- `scripts/download-uv.sh`
- `scripts/download-uv.ps1`

## Out of Scope

- **运行时自动更新 uv**：版本固定，需手动更新 `uv-version.txt` 后重新构建
- **macOS Intel 支持**：仅支持 Apple Silicon (aarch64-apple-darwin)
- **Linux ARM64 支持**：仅支持 x86_64-unknown-linux-gnu
- **Windows ARM64 支持**：仅支持 x86_64-pc-windows-msvc
- **uv 自我更新功能**：捆绑的 uv 不应调用 `uv self update`
