## Why

当前 Rust 后端代码集中在 3 个文件中（lib.rs 161行、commands.rs 207行、main.rs），职责混乱：
- 业务逻辑（环境创建、Jupyter管理）与 Tauri 命令层耦合
- 难以单独测试核心业务逻辑
- 未来扩展多环境管理、时光机等功能时需要大量重构
- 代码导航困难，新人理解成本高

随着 MVP 完成并准备进入下一阶段开发，现在重构可以：
- 为后续功能扩展（多环境管理、时光机、防炸盾）打好基础
- 降低技术债务，提高代码可维护性
- 便于添加单元测试和集成测试

## What Changes

将 `src-tauri/src/` 从扁平文件结构重构为模块化文件夹结构：

**目录结构重组**：
- 创建 `models/` - 数据模型层（EnvStatus, JupyterInfo, AppState）
- 创建 `infrastructure/` - 基础设施层（paths, process, constants）
- 创建 `domain/` - 核心业务逻辑层
  - `domain/environment/` - 环境管理领域（creator, verifier, kernel）
  - `domain/jupyter/` - Jupyter管理领域（launcher, terminator）
- 创建 `state/` - 状态管理层（AppStateWrapper）
- 创建 `api/` - Tauri 命令层（env_commands, jupyter_commands, state_commands）

**职责分离**：
- 将环境创建的 60 行逻辑从 commands.rs 提取到 domain/environment/creator.rs
- 将 Jupyter 启动/停止逻辑从 commands.rs 提取到 domain/jupyter/
- commands.rs 简化为 thin wrapper（每个命令 5-15 行）
- 所有路径相关函数集中到 infrastructure/paths.rs
- 提取魔法数字到 infrastructure/constants.rs

**依赖方向**：单向依赖，上层依赖下层
```
api/ → domain/ → infrastructure/ → models/
state/ (独立，被 api/ 和 domain/ 使用)
```

## Capabilities

**注**：此次重构不改变外部可见的行为，仅为内部代码组织优化。无新功能或行为变更，因此无需创建或修改 specs。

### New Capabilities
无（纯重构，不引入新能力）

### Modified Capabilities
无（REQUIREMENTS 无变化，仅实现重构）

## Impact

**受影响的代码**：
- `src-tauri/src/lib.rs` - 完全重写（仅保留模块声明和 run() 入口）
- `src-tauri/src/commands.rs` - 拆分为 `api/` 文件夹下的多个文件
- 新增约 15 个文件（models/, infrastructure/, domain/, state/, api/）

**不受影响的代码**：
- 前端（src/） - 零修改，Tauri 命令接口保持不变
- Tauri 配置（src-tauri/） - 无需修改
- 构建系统（Cargo.toml） - 自动发现 src/ 下的模块，无需修改

**依赖变更**：
- 无新增外部依赖

**测试策略**：
- 重构后手动测试：首次启动、环境创建、Jupyter 启动/停止
- 验证所有 Tauri 命令仍然工作正常

**风险**：
- 低风险：纯内部重构，外部 API 不变
- 每个步骤可独立验证，出问题可快速回滚
