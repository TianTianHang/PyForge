## Why

项目创建功能存在间歇性失败问题：用户点击"创建"按钮有时能成功创建项目，有时却无法创建。这是由多个bug共同导致的，包括前端验证逻辑错误、后端竞态条件、以及缺乏防重复提交机制。这些问题影响用户体验，可能导致数据丢失或不一致。

## What Changes

- 修复前端验证逻辑：将检查环境名称改为检查项目名称
- 添加前端防重复提交机制：禁用按钮并显示loading状态
- 改进前端状态管理：避免直接修改state对象
- 修复后端竞态条件：添加文件锁确保元数据读写的原子性
- 改进错误处理和用户反馈

## Capabilities

### New Capabilities

- `project-creation-atomic`: 确保项目创建操作的原子性和并发安全性

### Modified Capabilities

（无现有规范需要修改）

## Impact

### 前端影响
- `src/components/CreateProjectDialog.tsx`: 修复验证逻辑，添加防重复提交
- `src/components/ProjectPanel.tsx`: 传递正确的props
- `src/App.tsx`: 确保projects列表传递给CreateProjectDialog

### 后端影响
- `src-tauri/src/domain/project/creator.rs`: 添加文件锁
- `src-tauri/src/infrastructure/metadata.rs`: 支持带锁的元数据操作

### 依赖影响
- 可能需要添加 `fs2` crate用于文件锁

### 范围外
- 不改变项目创建的核心业务逻辑
- 不修改数据库结构或存储格式
- 不影响现有的项目列表和删除功能
