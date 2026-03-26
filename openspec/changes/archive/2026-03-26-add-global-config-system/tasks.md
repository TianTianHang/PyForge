## 1. 配置模型定义

- [x] 1.1 创建 `src-tauri/src/models/config.rs` 文件
- [x] 1.2 定义 `AppConfig` 结构体
- [x] 1.3 定义 `SourceConfig` 结构体（PyPI 源、Python 镜像源）
- [x] 1.4 定义 `PythonConfig` 结构体（默认版本、下载策略）
- [x] 1.5 定义 `PathsConfig` 结构体（数据目录）
- [x] 1.6 定义 `JupyterConfig` 结构体（端口范围、超时时间）
- [x] 1.7 定义 `DefaultsConfig` 结构体（默认安装包列表）
- [x] 1.8 实现 `Serialize`/`Deserialize` trait
- [x] 1.9 实现 `Default` trait（提供默认值）
- [x] 1.10 更新 `src-tauri/src/models/mod.rs` 导出 config 模块

## 2. 配置加载/保存逻辑

- [x] 2.1 创建 `src-tauri/src/infrastructure/config.rs` 文件
- [x] 2.2 实现 `get_config_path()` 函数
- [x] 2.3 实现 `load_config()` 函数
- [x] 2.4 实现 `save_config()` 函数
- [x] 2.5 实现 `init_config()` 函数（首次启动初始化）
- [x] 2.6 更新 `src-tauri/src/infrastructure/mod.rs` 导出 config 模块

## 3. uv.toml 生成逻辑

- [x] 3.1 创建 `src-tauri/src/infrastructure/uv_config.rs` 文件
- [x] 3.2 实现 `get_uv_config_path()` 函数
- [x] 3.3 实现 `write_uv_config()` 函数
- [x] 3.4 更新 `src-tauri/src/infrastructure/mod.rs` 导出 uv_config 模块

## 4. 路径管理改造

- [x] 4.1 修改 `src-tauri/src/infrastructure/paths.rs`
- [x] 4.2 添加 `OnceCell` 全局变量存储配置
- [x] 4.3 实现 `init_paths()` 函数
- [x] 4.4 改造 `get_pyforge_root()` 函数
- [x] 4.5 保持其他路径函数不变（它们调用 get_pyforge_root()）

## 5. uv 命令改造

- [x] 5.1 修改 `src-tauri/src/infrastructure/uv.rs`
- [x] 5.2 为 `run_uv_command()` 添加 `config_path` 参数
- [x] 5.3 实现 `--config-file` 参数传递逻辑

## 6. Tauri 命令接口

- [x] 6.1 创建 `src-tauri/src/api/config_commands.rs` 文件
- [x] 6.2 实现 `get_config()` 命令
- [x] 6.3 实现 `update_config()` 命令
- [x] 6.4 实现 `validate_data_dir()` 命令
- [x] 6.5 实现 `migrate_data()` 命令
- [x] 6.6 更新 `src-tauri/src/api/mod.rs` 导出 config_commands
- [x] 6.7 更新 `src-tauri/src/lib.rs` 注册命令

## 7. 移除硬编码

- [x] 7.1 修改 `src-tauri/src/infrastructure/constants.rs`
- [x] 7.2 修改 `src-tauri/src/domain/environment/creator.rs`
- [x] 7.3 修改 `src-tauri/src/domain/environment/package_manager.rs`
- [x] 7.4 修改 `src-tauri/src/domain/jupyter/base_env.rs`

## 8. 启动流程改造

- [x] 8.1 修改 `src-tauri/src/lib.rs` 的 `setup()` 函数
- [x] 8.2 实现配置加载流程
- [x] 8.3 实现路径初始化流程
- [x] 8.4 实现 uv.toml 生成流程
