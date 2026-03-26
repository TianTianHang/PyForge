## Why

PyForge 当前缺乏用户界面来修改配置和迁移数据目录。用户只能通过手动编辑配置文件来修改设置，这不友好且容易出错。需要一个专门的 Settings 页面来让用户可视化地管理配置和数据。

## What Changes

- 新增 Settings 主页面组件
- 新增源设置 Tab（PyPI 源、Python 安装源、下载策略）
- 新增路径设置 Tab（数据目录选择、迁移）
- 新增关于 Tab（版本信息、许可证）
- 新增配置管理 Hook（useSettings）
- 新增目录可写性检测功能
- 新增数据目录迁移功能（文件移动）
- 迁移后自动重启应用
- 在 App.tsx 中添加设置入口按钮

## Capabilities

### New Capabilities
- `settings-ui`: Settings 用户界面，包含源设置、路径设置、关于 Tab
- `data-migration`: 数据目录迁移功能，支持目录可写性检测和文件移动

### Modified Capabilities
- `global-config`: 全局配置系统，新增 Tauri 命令接口（已在提案 1 中实现）

## Impact

- 新增依赖：无
- 修改文件：
  - `src/App.tsx`（添加设置按钮）
  - `src/types/index.ts`（导出配置类型）
  - `src/types/config.ts`（新增）
  - `src/hooks/useSettings.ts`（新增）
  - `src/components/Settings/Settings.tsx`（新增）
  - `src/components/Settings/SourceSettings.tsx`（新增）
  - `src/components/Settings/PathSettings.tsx`（新增）
  - `src/components/Settings/AboutTab.tsx`（新增）
  - `src-tauri/src/api/config_commands.rs`（修改，新增迁移命令）
