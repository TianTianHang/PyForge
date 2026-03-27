## Why

当前 PyForge 项目的文件操作和符号链接处理过于复杂，导致维护困难和兼容性问题。具体问题包括：

1. 符号链接需要 Windows 特殊权限检查，用户常遇到权限错误
2. 代码中分散的文件操作逻辑导致重复和难以维护
3. 符号链接的迁移、转换逻辑复杂且容易出错
4. 平台相关代码增加了系统复杂度

将内核链接从符号链接改为复制可以大幅简化代码，提高系统稳定性和可维护性。

## What Changes

### 核心改动
- **BREAKING**: 将内核链接从符号链接改为直接文件复制
- **BREAKING**: 移除所有内核链接相关的符号链接权限检查逻辑
- **BREAKING**: 简化迁移逻辑，删除符号链接相关处理

### 文件调整
- **删除**: `src-tauri/src/domain/environment/kernel_links.rs` 中的符号链接创建逻辑
- **修改**: `src-tauri/src/infrastructure/data_migration.rs` 中的符号链接处理
- **修改**: `src-tauri/src/api/config_commands.rs` 中的符号链接相关函数
- **新增**: `src-tauri/src/infrastructure/file_ops.rs` 统一文件操作

### API 行为变化
- 内核绑定操作不再依赖符号链接，而是创建文件副本
- 迁移不再需要处理符号链接的转换和循环检测
- Windows 用户不再需要管理员权限或开发者模式来创建内核链接

## Capabilities

### New Capabilities
- `kernel-management`: 简化的内核管理，使用文件复制而非符号链接
- `file-operations`: 统一的跨平台文件操作抽象层
- `migration-simplified`: 简化的数据迁移逻辑

### Modified Capabilities
- `multi-project-management`: 内核绑定机制从符号链接改为复制
- `data-migration`: 移除符号链接处理，简化迁移流程

## Impact

### 影响的代码
- `src-tauri/src/domain/environment/kernel_links.rs` - 核心改动
- `src-tauri/src/infrastructure/data_migration.rs` - 简化迁移逻辑
- `src-tauri/src/api/config_commands.rs` - 简化 API 层
- `src-tauri/src/domain/project` - 项目相关的内核处理

### 性能影响
- **存储**: 每个项目将存储内核配置副本，增加少量存储空间（~1KB/内核）
- **性能**: 文件复制比符号链接创建稍慢，但对用户感知影响可忽略
- **启动**: 无显著影响

### 兼容性影响
- **向后不兼容**: 迁移后的项目将使用文件副本而非符号链接
- **平台兼容**: 消除 Windows 平台的特殊限制
- **权限要求**: 降低系统权限要求，提高可用性

### 维护收益
- **代码行数**: 预计减少约 500 行复杂代码
- **测试复杂度**: 简化测试，减少边界情况
- **用户问题**: 消除符号链接相关的常见用户问题