# Proposal: Improve Process Termination Logic

## Why

当前进程终止策略存在严重问题：Windows 平台上终止 Jupyter 进程时，子进程可能成为孤儿进程继续运行，导致资源泄漏和异常行为。同时缺少错误处理机制，无法有效诊断和报告进程终止失败的情况。

## What Changes

- **改进进程终止策略**：
  - Windows: 使用 `taskkill /F /T /PID` 代替 `taskkill /PID`（终止进程树）
  - Unix: 保持不变（Unix kill 命令天然支持进程树）

- **统一进程管理**：
  - 消除 `process.rs` 和 `terminator.rs` 中的重复代码
  - 将 `stop_jupyter_server` 重构为调用 `kill_forcefully`

- **添加错误处理**：
  - 检查命令执行状态
  - 提供有意义的错误消息
  - 记录调试信息

## Capabilities

### New Capabilities

- `robust-process-termination`: 提供健壮的进程终止功能，支持进程树终止和错误诊断

### Modified Capabilities

无（此为内部实现改进，不改变 API 或行为契约）

## Impact

**影响范围**：
- 文件：`src-tauri/src/infrastructure/process.rs`
- 文件：`src-tauri/src/domain/jupyter/terminator.rs`
- 函数：`kill_gracefully`, `kill_forcefully`, `stop_jupyter_server`

**影响评估**：
- ✅ 向后兼容（API 不变）
- ✅ 功能增强（更好的进程清理）
- ✅ 错误处理完善（调试信息更丰富）
- ⚠️ 重复代码消除（重构但不破坏现有功能）