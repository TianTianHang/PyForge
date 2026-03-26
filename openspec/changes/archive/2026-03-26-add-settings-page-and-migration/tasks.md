## 1. 配置类型定义

- [x] 1.1 创建 `src/types/config.ts` 文件
- [x] 1.2 定义 `AppConfig` 接口
- [x] 1.3 定义 `SourceConfig` 接口
- [x] 1.4 定义 `PythonConfig` 接口
- [x] 1.5 定义 `PathsConfig` 接口
- [x] 1.6 定义 `JupyterConfig` 接口
- [x] 1.7 定义 `DefaultsConfig` 接口
- [x] 1.8 定义 `ValidationResult` 接口
- [x] 1.9 更新 `src/types/index.ts` 导出配置类型

## 2. 配置管理 Hook

- [x] 2.1 创建 `src/hooks/useSettings.ts` 文件
- [x] 2.2 实现 `getConfig()` 函数
- [x] 2.3 实现 `updateConfig()` 函数
- [x] 2.4 实现 `validateDataDir()` 函数
- [x] 2.5 实现 `migrateData()` 函数

## 3. Settings 主页面

- [x] 3.1 创建 `src/components/Settings/Settings.tsx` 文件
- [x] 3.2 实现 Tab 容器结构
- [x] 3.3 实现保存按钮逻辑
- [x] 3.4 实现重置按钮逻辑
- [x] 3.5 实现加载状态显示
- [x] 3.6 实现保存成功提示

## 4. 源设置 Tab

- [x] 4.1 创建 `src/components/Settings/SourceSettings.tsx` 文件
- [x] 4.2 实现 PyPI 源选择器
- [x] 4.3 实现 PyPI 自定义输入
- [x] 4.4 实现 Python 安装源选择器
- [x] 4.5 实现 Python 安装源自定义输入
- [x] 4.6 实现下载策略选择器
- [x] 4.7 实现配置更新逻辑

## 5. 路径设置 Tab

- [x] 5.1 创建 `src/components/Settings/PathSettings.tsx` 文件
- [x] 5.2 实现当前数据目录显示
- [x] 5.3 实现数据目录选择器
- [x] 5.4 实现数据目录输入
- [x] 5.5 实现目录可写性检测显示
- [x] 5.6 实现迁移按钮逻辑
- [x] 5.7 实现迁移确认对话框
- [x] 5.8 实现迁移进度显示

## 6. 关于 Tab

- [x] 6.1 创建 `src/components/Settings/AboutTab.tsx` 文件
- [x] 6.2 实现版本信息显示
- [x] 6.3 实现构建信息显示
- [x] 6.4 实现许可证显示

## 7. 目录可写性检测

- [x] 7.1 创建 `src-tauri/src/infrastructure/dir_validator.rs` 文件
- [x] 7.2 实现 `validate_directory()` 函数
- [x] 7.3 实现测试文件创建逻辑
- [x] 7.4 实现测试文件写入逻辑
- [x] 7.5 实现测试文件读取逻辑
- [x] 7.6 实现测试文件删除逻辑

## 8. 数据迁移逻辑

- [x] 8.1 创建 `src-tauri/src/infrastructure/data_migration.rs` 文件
- [x] 8.2 实现 `migrate_data_dir()` 函数
- [x] 8.3 实现环境目录迁移逻辑
- [x] 8.4 实现项目目录迁移逻辑
- [x] 8.5 实现内核目录迁移逻辑
- [x] 8.6 实现基础环境迁移逻辑
- [x] 8.7 实现元数据文件迁移逻辑
- [x] 8.8 实现配置文件迁移逻辑
- [x] 8.9 实现配置文件更新逻辑
- [x] 8.10 实现 uv.toml 重新生成逻辑

## 9. Tauri 命令接口

- [x] 9.1 修改 `src-tauri/src/api/config_commands.rs` 文件
- [x] 9.2 添加 `migrate_data()` 命令
- [x] 9.3 添加 `validate_data_dir()` 命令
- [x] 9.4 更新 `src-tauri/src/api/mod.rs` 导出命令

## 10. UI 入口

- [x] 10.1 修改 `src/App.tsx` 文件
- [x] 10.2 添加设置按钮
- [x] 10.3 添加 showSettings 状态
- [x] 10.4 实现 Settings 页面渲染逻辑
