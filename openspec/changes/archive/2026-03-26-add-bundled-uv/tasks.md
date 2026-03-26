## 1. 配置与依赖

- [x] 1.1 创建 `src-tauri/uv-version.txt`，内容为 `0.11.1`
- [x] 1.2 创建 `src-tauri/binaries/.gitkeep` 占位文件
- [x] 1.3 修改 `src-tauri/Cargo.toml`，添加 `tauri-plugin-shell = "2"`
- [x] 1.4 修改 `src-tauri/tauri.conf.json`，添加 `bundle.externalBin: ["binaries/uv"]`
- [x] 1.5 修改 `src-tauri/capabilities/default.json`，添加 `shell:allow-execute` 权限（sidecar: true）

## 2. Rust 基础设施

- [x] 2.1 创建 `src-tauri/src/infrastructure/uv.rs`，实现 `get_uv_sidecar(app: &AppHandle)` 函数
- [x] 2.2 修改 `src-tauri/src/infrastructure/mod.rs`，导出 uv 模块
- [x] 2.3 修改 `src-tauri/src/lib.rs`，添加 `.plugin(tauri_plugin_shell::init())`

## 3. Rust 域代码修改

- [x] 3.1 修改 `src-tauri/src/domain/environment/package_manager.rs`，将 3 处 `Command::new("uv")` 改为 sidecar 调用（需传入 AppHandle）
- [x] 3.2 修改 `src-tauri/src/domain/environment/creator.rs`，将 2 处 `Command::new("uv")` 改为 sidecar 调用
- [x] 3.3 修改 `src-tauri/src/domain/jupyter/base_env.rs`，将 2 处 `Command::new("uv")` 改为 sidecar 调用

## 4. 构建脚本

- [x] 4.1 创建 `scripts/download-uv.sh`（Linux/macOS），接受 target triple 参数，下载并放置到 `src-tauri/binaries/`
- [x] 4.2 创建 `scripts/download-uv.ps1`（Windows），同上逻辑

## 5. CI/CD 配置

- [x] 5.1 修改 `.github/workflows/build.yml`，移除 `x86_64-apple-darwin` 构建
- [x] 5.2 修改 `.github/workflows/build.yml`，在 tauri-action 之前添加下载 uv 步骤

## 6. 验证

- [x] 6.1 本地运行下载脚本，验证 `src-tauri/binaries/` 下生成正确的二进制文件
- [x] 6.2 修复 Tauri 2.0 sidecar API 编译错误（修复所有类型导入问题，包括从 std::sync::Mutex 改为 tokio::sync::Mutex）
- [ ] 6.3 本地构建 `pnpm tauri build`，验证应用正常启动且 uv 调用正常
- [ ] 6.4 创建环境、安装包、启动 Jupyter，验证完整流程
