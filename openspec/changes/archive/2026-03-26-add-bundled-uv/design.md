## Context

PyForge 使用 uv 管理 Python 虚拟环境和包安装。当前代码直接调用系统 `uv` 命令，要求用户预先安装。Tauri 2.0 提供 `externalBin` 机制，可以将外部二进制文件捆绑到应用包中，运行时通过 `tauri-plugin-shell` 的 sidecar API 调用。

核心约束：
- 固定版本：使用 `uv-version.txt` 文件管理版本号，构建时下载
- 下载失败即构建失败：不提供降级或重试机制
- 目标平台：macOS Apple Silicon、Linux x64、Windows x64（共 3 个平台）

## Goals / Non-Goals

**Goals:**
- 用户无需安装 uv，开箱即用
- uv 版本固定，确保行为一致
- 构建时自动下载对应平台的二进制
- 本地开发和 CI/CD 都能正常构建

**Non-Goals:**
- 运行时自动更新 uv
- 支持 macOS Intel / Linux ARM64 / Windows ARM64
- uv 自我更新功能

## Decisions

### 1. 版本管理：单独文件 `uv-version.txt`

**选择：`src-tauri/uv-version.txt`，内容为版本号如 `0.11.1`**

理由：
- 简单明确，一行文本，Git diff 清晰
- 构建脚本和 Rust 代码都能方便读取
- 不污染其他配置文件（tauri.conf.json / Cargo.toml / package.json）

文件位置：`src-tauri/uv-version.txt`（与 tauri.conf.json 同目录，便于构建脚本定位）

### 2. 下载时机：GitHub Actions step

**选择：在 `tauri-apps/tauri-action` 之前添加下载 step**

理由：
- 构建脚本需要在 `tauri build` 之前运行，将二进制放到 `src-tauri/binaries/`
- GitHub Actions step 比 `beforeBuildCommand` 更灵活，可以按平台条件执行
- `beforeBuildCommand` 会同时影响 dev 和 build，下载逻辑不适合 dev 环境

本地开发时，需要手动运行一次下载脚本，或在 `beforeDevCommand` 中也添加下载逻辑（但考虑到开发频率，建议手动）。

### 3. 调用方式：tauri-plugin-shell sidecar

**选择：使用 `app.shell().sidecar("uv")` 而非 `Command::new("uv")`**

理由：
- Tauri 的 sidecar 机制自动处理平台后缀（`uv-x86_64-unknown-linux-gnu`）
- 统一的权限管理（通过 capabilities 配置）
- 与 Tauri 生态一致

调用变更示例：
```rust
// 之前
let output = Command::new("uv")
    .args(["venv", path, "--python", "3.12"])
    .output().await?;

// 之后
let (mut rx, mut child) = app.shell().sidecar("uv")
    .map_err(|e| e.to_string())?
    .args(["venv", path, "--python", "3.12"])
    .spawn()
    .map_err(|e| e.to_string())?;
```

### 4. 下载失败处理：构建失败

**选择：下载失败时脚本返回非零退出码，构建终止**

理由：
- uv 是核心依赖，没有它应用完全无法工作
- 不提供降级到系统 uv 的选项（会破坏"零配置"目标）
- CI/CD 中构建失败会触发告警，便于及时发现

### 5. 目标平台矩阵

| 平台 | Target Triple | uv 文件名 |
|------|--------------|-----------|
| macOS Apple Silicon | aarch64-apple-darwin | uv-aarch64-apple-darwin |
| Linux x64 | x86_64-unknown-linux-gnu | uv-x86_64-unknown-linux-gnu |
| Windows x64 | x86_64-pc-windows-msvc | uv-x86_64-pc-windows-msvc.exe |

CI/CD 矩阵从 4 个减少到 3 个（移除 macOS Intel）。

## Risks / Trade-offs

**[Risk] macOS 代码签名** → 捆绑的 uv 二进制需要签名，否则 macOS Gatekeeper 会阻止执行。需要在构建后对 sidecar 进行 codesign。

**[Risk] GitHub Actions 下载不稳定** → 网络问题可能导致下载失败。当前策略是直接失败，用户可手动重试。后续可考虑添加重试逻辑或使用 GitHub Releases 镜像。

**[Trade-off] 应用体积增加** → uv 二进制约 15MB，每个平台的安装包增加相应体积。可接受，因为减少了用户安装步骤。

**[Trade-off] 版本更新需要重新构建** → 更新 uv 版本需要修改 `uv-version.txt` 并触发新构建。对于桌面应用这是正常流程。

## Migration Plan

无数据迁移需求。这是纯技术变更，不影响用户数据或配置。

升级后首次启动行为不变：检查环境 → 创建/加载环境 → 启动 Jupyter。

## Open Questions

- macOS codesign 的具体流程需要在实际构建时验证
- 本地开发时是否需要自动化下载脚本（当前建议手动运行一次）
