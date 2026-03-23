## Context

**当前状态**：
- Rust 后端代码组织在 3 个文件中：`lib.rs` (161行)、`commands.rs` (207行)、`main.rs` (~5行)
- lib.rs 包含：数据结构定义、路径管理、环境检查函数、工具函数、状态管理、Tauri 入口
- commands.rs 包含：Tauri 命令层、环境创建详细逻辑（uv 调用、包安装、内核注册）、Jupyter 管理详细逻辑（启动、停止、健康检查）
- 职责混乱导致业务逻辑与命令层耦合，难以测试和扩展

**约束条件**：
- 不改变前端接口（Tauri 命令签名保持不变）
- 不引入新的外部依赖
- 保持现有功能完全正常工作
- 必须通过 `pnpm tauri dev` 和 `pnpm tauri build` 构建

**技术栈**：
- Rust + Tauri 2.0
- tokio（异步运行时）
- serde（序列化）
- dirs、rand、uuid（工具库）

## Goals / Non-Goals

**Goals:**
1. 建立清晰的分层架构：models → infrastructure → domain → api
2. 将业务逻辑从 Tauri 命令层中提取出来，便于单元测试
3. 按领域划分模块（environment、jupyter），便于未来扩展
4. 单个文件行数控制在 100 行以内
5. 每个模块职责单一，依赖关系单向

**Non-Goals:**
- 不添加新的功能或行为
- 不改变 Tauri 命令的接口
- 不引入新的外部依赖
- 不修改前端代码
- 不添加测试框架（测试基础设施留待后续）

## Decisions

### 决策 1: 采用领域驱动设计（DDD）风格的模块划分

**选择**：按业务领域划分（environment、jupyter），而非按技术层次划分（service、repository）

**理由**：
- 更符合业务语言：环境管理、Jupyter 管理是清晰的核心领域
- 便于未来扩展：添加新领域（如 history、auth）只需新建文件夹
- 更好的内聚性：每个领域的逻辑集中在一起

**替代方案**：按技术层次划分（service 层、repository 层）
- **不采用原因**：对于当前规模过于复杂，容易过度工程化

### 决策 2: infrastructure/ 作为独立的基础设施层

**选择**：创建 infrastructure/ 文件夹，包含 paths.rs、process.rs、constants.rs

**理由**：
- paths.rs：路径逻辑未来会变复杂（多环境支持），现在隔离可以减少后续影响
- process.rs：进程管理（spawn、kill、wait）是通用能力，未来可能被其他模块复用（如防炸盾）
- constants.rs：集中管理魔法数字，便于调优和维护

**替代方案**：将路径和进程管理逻辑分散到各 domain 模块
- **不采用原因**：代码重复，难以统一修改（如统一进程超时策略）

### 决策 3: api/ 文件夹作为 thin wrapper 层

**选择**：将 commands.rs 拆分为 api/ 下的多个文件，每个命令 5-15 行

**理由**：
- 保持 Tauri 命令层的轻量，便于理解命令入口
- 业务逻辑在 domain/ 层，可独立测试
- 未来添加新命令时，只需在 api/ 下添加新文件

**替代方案**：保留单一大文件 commands.rs
- **不采用原因**：违背了重构的初衷，文件仍然过大

### 决策 4: 使用 pub use 导出公共接口

**选择**：每个模块的 mod.rs 使用 `pub use` 重新导出重要类型和函数

**示例**：
```rust
// domain/environment/mod.rs
pub use creator::{create_default_environment, CreateProgress};
pub use verifier::{check_env_exists, verify_environment};
```

**理由**：
- 简化导入路径：`use crate::domain::environment::create_default_environment` 而非 `use crate::domain::environment::creator::create_default_environment`
- 隐藏内部实现细节（creator、verifier 是私有模块）
- 便于未来重构内部结构而不影响使用者

**替代方案**：直接导出子模块，让使用者导入完整路径
- **不采用原因**：导入路径过长，降低代码可读性

### 决策 5: state/ 模块提供辅助方法而非直接暴露 Mutex

**选择**：AppStateWrapper 提供如 `update_env_status()`、`set_jupyter_info()` 等方法

**理由**：
- 封装 Mutex 锁的细节，避免使用者在 `.await` 前忘记释放锁
- 便于添加状态变更事件（未来可能需要）
- 类型安全，避免直接操作 AppState

**替代方案**：直接暴露 Mutex<AppState>，让使用者自行加锁
- **不采用原因**：容易出错（异步代码中持有锁跨越 .await 会导致死锁）

### 决策 6: 进程终止策略（优雅关闭优先）

**选择**：stop_jupyter 时先 SIGTERM（或 taskkill），等待 2 秒后仍未退出再 SIGKILL（-9）

**理由**：
- 给 Jupyter 机会保存状态和清理资源
- 减少数据丢失风险
- 兼顾用户体验（不能无限等待）

**替代方案**：直接使用 kill -9 强制终止
- **不采用原因**：可能导致 Jupyter 未保存的 notebook 丢失

**实现位置**：infrastructure/process.rs 提供通用方法：
```rust
pub async fn kill_gracefully(pid: u32, timeout_secs: u64) -> Result<(), String>
pub async fn kill_forcefully(pid: u32) -> Result<(), String>
```

## Risks / Trade-offs

### 风险 1: 重构过程中引入编译错误

**可能性**：中

**影响**：阻塞开发，浪费时间调试

**缓解措施**：
- 分阶段重构：先创建 models/ 和 infrastructure/（低风险），再提取 domain/，最后重构 api/
- 每个阶段都运行 `cargo check` 验证编译
- 使用 git 分支，随时可以回滚

### 风险 2: 循环依赖导致编译失败

**可能性**：低（但需警惕）

**影响**：架构设计需要重新调整

**缓解措施**：
- 严格遵守单向依赖原则：上层依赖下层
- domain/ 的子模块（environment、jupyter）之间禁止互相依赖
- 使用 dependency injection（通过函数参数传递依赖）而非直接引用

### 风险 3: 重构后功能回归问题

**可能性**：低

**影响**：用户遇到功能异常

**缓解措施**：
- 重构后手动测试所有核心流程：首次启动、环境创建、Jupyter 启动/停止
- 保留原有的错误处理逻辑，不改变错误消息
- 不修改 Tauri 命令的签名，确保前端兼容

### 权衡 1: 文件数量增加 vs. 职责清晰

**选择**：接受文件数量增加（从 3 个到约 15 个）

**理由**：
- 每个文件平均 50-80 行，易于阅读和理解
- 按职责分组，新人可以快速定位代码
- IDE 支持良好（文件搜索、符号跳转）

**代价**：需要创建更多文件，初期工作量略大

### 权衡 2: 重构工作量 vs. 后续扩展性

**选择**：现在投入时间重构（预计 2-3 小时）

**理由**：
- 为后续功能（多环境、时光机、防炸盾）打好基础
- 避免技术债务累积，未来修改成本更高
- 代码可读性提升，长期维护成本降低

**代价**：短期内没有新功能交付

## Migration Plan

### Phase 1: 创建骨架（5 分钟）

```bash
cd src-tauri/src
mkdir -p models infrastructure/domain/environment infrastructure/domain/jupyter state api
touch models/mod.rs infrastructure/mod.rs domain/mod.rs \
      domain/environment/mod.rs domain/jupyter/mod.rs \
      state/mod.rs api/mod.rs
```

### Phase 2: 迁移 models（10 分钟）

1. 创建 `models/env.rs`：移动 EnvStatus
2. 创建 `models/jupyter.rs`：移动 JupyterInfo，新增 JupyterServerConfig
3. 创建 `models/app.rs`：移动 AppState
4. 更新 `models/mod.rs`：重新导出所有类型
5. 运行 `cargo check` 验证

### Phase 3: 迁移 infrastructure（15 分钟）

1. 创建 `infrastructure/paths.rs`：移动所有路径函数
2. 创建 `infrastructure/constants.rs`：提取魔法数字
3. 创建 `infrastructure/process.rs`：封装进程管理（新文件）
4. 更新 `infrastructure/mod.rs`：重新导出
5. 运行 `cargo check` 验证

### Phase 4: 提取 domain/environment（20 分钟）

1. 创建 `domain/environment/creator.rs`：提取 create_env 中的逻辑
2. 创建 `domain/environment/verifier.rs`：提取 check_env_exists
3. 创建 `domain/environment/kernel.rs`：提取内核注册逻辑
4. 更新 `domain/environment/mod.rs`：重新导出公共接口
5. 运行 `cargo check` 验证

### Phase 5: 提取 domain/jupyter（20 分钟）

1. 创建 `domain/jupyter/launcher.rs`：提取 start_jupyter 中的逻辑
2. 创建 `domain/jupyter/terminator.rs`：提取 stop_jupyter 中的逻辑
3. 更新 `domain/jupyter/mod.rs`：定义 JupyterServer struct
4. 运行 `cargo check` 验证

### Phase 6: 重构 api/ 和 state（20 分钟）

1. 创建 `state/mod.rs`：提取 AppStateWrapper，添加辅助方法
2. 创建 `api/env_commands.rs`：重写环境相关命令
3. 创建 `api/jupyter_commands.rs`：重写 Jupyter 相关命令
4. 创建 `api/state_commands.rs`：重写状态查询命令
5. 更新 `api/mod.rs`：重新导出所有命令
6. 运行 `cargo check` 验证

### Phase 7: 重写 lib.rs（10 分钟）

1. 清空 lib.rs，仅保留模块声明和 run() 函数
2. 更新 invoke_handler，使用新路径的命令
3. 运行 `cargo check` 和 `cargo test` 验证

### Phase 8: 集成测试（15 分钟）

1. 运行 `pnpm tauri dev` 启动应用
2. 测试首次启动（环境创建流程）
3. 测试 Jupyter 启动/停止
4. 验证所有 Tauri 命令工作正常
5. 运行 `pnpm tauri build` 验证打包

### Rollback 策略

每个 Phase 完成后提交 git，如果后续 Phase 出现问题：
```bash
git reset --hard <commit-hash>  # 回滚到上一个稳定状态
```

## Open Questions

无。重构方案已充分讨论，技术路径清晰。
