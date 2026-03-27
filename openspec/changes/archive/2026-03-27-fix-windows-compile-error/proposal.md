# Proposal: Fix Windows Compile Error

## Why

Windows 平台编译失败，错误位于 `src-tauri/src/api/config_commands.rs:227`，类型不匹配导致无法构建。这是阻塞 Windows 平台开发的严重问题，必须立即修复。

## What Changes

- 修复 `guess_symlink_type` 函数中的类型错误
- 将 `file_exts.contains(&*ext_str)` 改为 `file_exts.contains(&ext_str.as_ref())`
- 不改变任何功能逻辑，仅修复类型系统问题

## Capabilities

### New Capabilities

无（这是 bug 修复，不引入新功能）

### Modified Capabilities

无（不改变任何规范级别的需求，仅修复实现细节）

## Impact

**影响范围**：
- 文件：`src-tauri/src/api/config_commands.rs`
- 函数：`guess_symlink_type` (行 215-234)
- 代码行：227
- 平台：仅影响 Windows 编译（Unix 平台不使用此函数）

**影响评估**：
- ✅ 无 API 变更
- ✅ 无行为变更
- ✅ 无依赖变更
- ✅ 单文件修改
- ✅ 低风险修复