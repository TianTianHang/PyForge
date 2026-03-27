# Proposal: Add Windows Symlink Permission Check

## Why

Windows 平台默认需要管理员权限才能创建符号链接，普通用户会遇到 `ERROR_PRIVILEGE_NOT_HELD` 错误。当前代码直接尝试创建符号链接，提供的是通用的错误消息，用户无法理解失败原因并知道如何解决。必须添加权限检测和友好的用户指导。

## What Changes

- **权限检测**：
  - 在创建符号链接前检查权限
  - Windows: 尝试创建临时符号链接验证权限
  - Unix: 无需额外检查（权限模型不同）

- **友好错误提示**：
  - 权限不足时提供明确的解决方案
  - 包含开发者模式启用指南
  - 提供外部链接供用户参考

- **性能考虑**：
  - 权限检查仅在 Windows 上执行
  - 使用快速失败机制，避免不必要的操作

## Capabilities

### New Capabilities

- `symlink-permission-detection`: 检测并提示 Windows 符号链接权限问题
- `user-friendly-error-messages`: 为权限相关错误提供指导性解决方案

### Modified Capabilities

无（此为增强错误处理，不改变 API 或核心功能）

## Impact

**影响范围**：
- 文件：`src-tauri/src/domain/environment/kernel_links.rs`
- 函数：`bind_kernel_to_project`（Windows 部分）
- 影响的流程：内核绑定、环境创建、数据迁移

**影响评估**：
- ✅ 向后兼容（API 不变）
- ✅ 用户体验提升（错误信息更友好）
- ✅ 减少支持工单（提供解决方案）
- ⚠️ 轻微性能开销（权限检查仅执行一次）