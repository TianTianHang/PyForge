## 1. 创建目录结构骨架

- [x] 1.1 创建 models/ 文件夹和 mod.rs
- [x] 1.2 创建 infrastructure/ 文件夹和 mod.rs
- [x] 1.3 创建 infrastructure/domain/environment/ 文件夹和 mod.rs
- [x] 1.4 创建 infrastructure/domain/jupyter/ 文件夹和 mod.rs
- [x] 1.5 创建 state/ 文件夹和 mod.rs
- [x] 1.6 创建 api/ 文件夹和 mod.rs
- [x] 1.7 运行 `cargo check` 验证目录结构创建成功

## 2. 迁移数据模型层（models/）

- [x] 2.1 创建 models/env.rs，移动 EnvStatus 结构体
- [x] 2.2 创建 models/jupyter.rs，移动 JupyterInfo，新增 JupyterServerConfig
- [x] 2.3 创建 models/app.rs，移动 AppState 结构体
- [x] 2.4 更新 models/mod.rs，使用 `pub use` 重新导出所有类型
- [x] 2.5 运行 `cargo check` 验证模型层编译通过

## 3. 迁移基础设施层（infrastructure/）

- [x] 3.1 创建 infrastructure/paths.rs，移动所有路径相关函数（get_pyforge_root, get_env_dir, get_project_dir, ensure_dir, get_python_path, get_jupyter_path）
- [x] 3.2 创建 infrastructure/constants.rs，提取魔法数字（PORT_RANGE, JUPYTER_READY_TIMEOUT_SECS, PYPI_MIRROR_URL, DEFAULT_PYTHON_VERSION）
- [x] 3.3 创建 infrastructure/process.rs，实现进程管理函数（spawn, kill_gracefully, kill_forcefully, wait_for_ready）
- [x] 3.4 更新 infrastructure/mod.rs，使用 `pub use` 重新导出所有公共接口
- [x] 3.5 运行 `cargo check` 验证基础设施层编译通过

## 4. 提取环境管理领域（domain/environment/）

- [x] 4.1 创建 domain/environment/creator.rs，提取 create_env 中的环境创建逻辑（创建venv、安装包、注册内核），实现 create_default_environment 函数和 CreateProgress 枚举
- [x] 4.2 创建 domain/environment/verifier.rs，提取 check_env_exists 和 verify_environment 函数
- [x] 4.3 创建 domain/environment/kernel.rs，提取内核注册逻辑到 register_jupyter_kernel 函数
- [x] 4.4 更新 domain/environment/mod.rs，使用 `pub use` 重新导出公共接口
- [x] 4.5 运行 `cargo check` 验证环境领域编译通过

## 5. 提取 Jupyter 管理领域（domain/jupyter/）

- [x] 5.1 创建 domain/jupyter/launcher.rs，提取 start_jupyter 中的启动逻辑，实现 start_jupyter_server 函数
- [x] 5.2 创建 domain/jupyter/terminator.rs，提取 stop_jupyter 中的停止逻辑，实现 stop_jupyter_server 函数
- [x] 5.3 创建 domain/jupyter/mod.rs，定义 JupyterServer struct，封装启动和停止逻辑
- [x] 5.4 更新 domain/mod.rs，声明 environment 和 jupyter 子模块
- [x] 5.5 运行 `cargo check` 验证 Jupyter 领域编译通过

## 6. 重构状态管理层（state/）

- [x] 6.1 创建 state/mod.rs，从 lib.rs 移动 AppStateWrapper
- [x] 6.2 为 AppStateWrapper 添加辅助方法（update_env_status, set_jupyter_info, clear_jupyter, get_jupyter_info）
- [x] 6.3 运行 `cargo check` 验证状态管理层编译通过

## 7. 重构 Tauri 命令层（api/）

- [x] 7.1 创建 api/env_commands.rs，实现 check_env 和 create_env 命令（调用 domain/environment/ 的业务逻辑）
- [x] 7.2 创建 api/jupyter_commands.rs，实现 start_jupyter 和 stop_jupyter 命令（调用 domain/jupyter/ 的业务逻辑）
- [x] 7.3 创建 api/state_commands.rs，实现 get_jupyter_info 和 get_app_state 命令
- [x] 7.4 更新 api/mod.rs，使用 `pub use` 重新导出所有命令
- [x] 7.5 运行 `cargo check` 验证 API 层编译通过

## 8. 重写 lib.rs 入口文件

- [x] 8.1 清空 lib.rs，移除所有函数实现（仅保留模块声明）
- [x] 8.2 在 lib.rs 中声明所有模块（models, infrastructure, domain, state, api）
- [x] 8.3 重写 lib.rs 的 run() 函数，更新 invoke_handler 使用新路径的命令（api::env_commands::*, api::jupyter_commands::*, api::state_commands::*）
- [x] 8.4 保留 lib.rs 的 setup_initial_state 逻辑，迁移到使用新的 state::AppStateWrapper 辅助方法
- [x] 8.5 运行 `cargo check` 验证整个项目编译通过
- [x] 8.6 运行 `cargo test` 验证所有测试通过（如有）

## 9. 集成测试验证

- [x] 9.1 运行 `pnpm tauri dev` 启动开发环境，验证应用正常启动
- [x] 9.2 测试首次启动流程：删除 ~/.pyforge 后启动，验证环境创建步骤正确显示
- [x] 9.3 测试 Jupyter 启动：点击"开始准备环境"后，验证 Jupyter Lab 正常加载
- [x] 9.4 测试 Jupyter 停止：点击"停止"按钮，验证 Jupyter 进程正确终止
- [x] 9.5 测试环境已存在场景：重启应用，验证直接进入 Jupyter（跳过环境创建）
- [x] 9.6 运行 `pnpm tauri build` 验证打包成功
- [ ] 9.7 提交 git commit，标记重构完成

## 10. 清理和文档

- [x] 10.1 删除旧的 commands.rs 文件（已拆分到 api/）
- [x] 10.2 检查并移除 lib.rs 中残留的注释和未使用的代码
- [x] 10.3 验证所有文件行数 < 100 行（如超过，考虑进一步拆分）
- [x] 10.4 运行 `cargo clippy` 检查代码质量，修复警告
- [ ] 10.5 最终提交 git commit，完成重构
