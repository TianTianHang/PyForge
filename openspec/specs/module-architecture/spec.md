# Module Architecture

## Overview

PyForge 采用分层架构设计，系统被划分为五个主要层级：
- Frontend Layer (前端层)
- API Layer (API 层)
- Domain Layer (领域层)
- Infrastructure Layer (基础设施层)
- Support Modules (支撑模块)

每个层级和模块都有明确的职责边界，遵循依赖倒置原则。

## Requirements

### Requirement: 分层架构约束
系统 SHALL 严格遵守分层架构的依赖规则。

#### Scenario: 依赖方向约束
- **WHEN** 模块间存在依赖关系
- **THEN** 上层模块可以依赖下层模块
- **AND** 下层模块不得依赖上层模块
- **AND** 同层模块间应通过接口解耦

#### Scenario: 跨层访问约束
- **WHEN** 前端需要访问后端功能
- **THEN** 必须通过 Tauri IPC 机制
- **AND** 只能调用 API 层定义的命令
- **AND** 不得直接访问 Domain 层或 Infrastructure 层

### Requirement: API 层职责边界
API 层 SHALL 仅负责协议转换和参数验证，不包含业务逻辑。

#### Scenario: API 命令定义
- **WHEN** 定义 Tauri 命令
- **THEN** 函数必须标记为 `#[tauri::command]`
- **AND** 函数应只进行参数验证和序列化
- **AND** 业务逻辑必须委托给 Domain 层
- **AND** 返回值必须是 `Result<T, String>` 类型

#### Scenario: 禁止直接文件操作
- **WHEN** API 层函数需要操作文件系统
- **THEN** 必须调用 Infrastructure 层提供的函数
- **AND** 不得直接使用 `std::fs` 或其他文件操作 API

#### Scenario: 子模块划分
- **WHEN** API 层需要新增功能
- **THEN** 应根据功能领域划分到以下子模块：
  - `env_commands` - 环境管理相关命令
  - `project_commands` - 项目管理相关命令
  - `jupyter_commands` - Jupyter 服务相关命令
  - `config_commands` - 配置管理相关命令
  - `template_commands` - 模板相关命令
  - `state_commands` - 应用状态查询命令

### Requirement: Domain 层职责边界
Domain 层 SHALL 包含所有业务逻辑，不依赖技术实现细节。

#### Scenario: Environment Domain 职责
- **WHEN** 操作 Environment Domain
- **THEN** 负责创建/删除/列出 Python 虚拟环境
- **AND** 负责 Jupyter kernel 注册和管理
- **AND** 负责环境与项目的内核绑定关系
- **AND** 负责包管理操作
- **AND** 不得直接调用 uv 命令（委托给 Infrastructure 层）
- **AND** 不得直接操作路径（委托给 Infrastructure 层）

#### Scenario: Environment Domain 子模块划分
- **WHEN** 扩展 Environment Domain
- **THEN** 应根据职责划分到以下子模块：
  - `creator` - 环境创建逻辑
  - `deleter` - 环境删除逻辑
  - `lister` - 环境列表查询
  - `verifier` - 环境验证逻辑
  - `kernel` - Jupyter kernel 注册/注销
  - `kernel_links` - 内核与项目的绑定关系管理
  - `package_manager` - 包安装/卸载/查询

#### Scenario: Project Domain 职责
- **WHEN** 操作 Project Domain
- **THEN** 负责创建/删除/列出项目
- **AND** 负责项目元数据管理
- **AND** 不得管理项目内的具体文件（由 Jupyter 接管）

#### Scenario: Jupyter Domain 职责
- **WHEN** 操作 Jupyter Domain
- **THEN** 负责 Base 环境管理（确保 JupyterLab 可用）
- **AND** 负责启动/停止 Jupyter Server
- **AND** 负责端口管理和 token 生成
- **AND** 负责配置内核目录
- **AND** 不得管理具体 notebook 文件
- **AND** 不得负责代码执行（由 Jupyter Kernel 处理）

#### Scenario: Domain 层隔离
- **WHEN** Domain 层函数需要技术实现
- **THEN** 必须定义抽象接口
- **AND** 由 Infrastructure 层提供具体实现
- **AND** 通过依赖注入或参数传递获取实现

### Requirement: Infrastructure 层职责边界
Infrastructure 层 SHALL 提供技术实现和跨领域服务，不包含业务逻辑。

#### Scenario: 核心基础设施模块
- **WHEN** 提供核心基础设施服务
- **THEN** 应包含以下模块：
  - `paths` - 所有路径定义和管理
  - `config` - 全局配置加载/保存
  - `metadata` - 元数据存储管理
  - `util` - 通用工具函数
  - `constants` - 常量定义

#### Scenario: Python 环境管理模块
- **WHEN** 提供 Python 环境支持
- **THEN** 应包含以下模块：
  - `uv` - uv sidecar 命令执行
  - `uv_config` - uv 配置文件管理
  - `process` - 进程生命周期管理

#### Scenario: 数据管理模块
- **WHEN** 提供数据迁移和验证服务
- **THEN** 应包含以下模块：
  - `migration` - MVP 数据迁移
  - `data_migration` - 数据目录迁移
  - `dir_validator` - 目录验证

#### Scenario: Infrastructure 层业务逻辑禁止
- **WHEN** Infrastructure 层实现功能
- **THEN** 不得包含业务决策逻辑
- **AND** 只提供可复用的技术服务
- **AND** 接受 Domain 层的参数和配置

### Requirement: Models 层职责边界
Models 层 SHALL 只负责数据结构定义和序列化，不包含业务逻辑。

#### Scenario: 数据模型定义
- **WHEN** 定义数据模型
- **THEN** 必须使用 `serde` 的 `Serialize` 和 `Deserialize` trait
- **AND** 模型应为纯数据结构（struct 或 enum）
- **AND** 不得包含业务方法
- **AND** 可以包含简单的辅助方法（如构造函数、getter）

#### Scenario: 核心数据模型
- **WHEN** 系统需要数据结构
- **THEN** 应定义在以下模型中：
  - `app` - AppState 应用状态模型
  - `env` - Environment 环境模型
  - `project` - Project 项目模型
  - `jupyter` - JupyterInfo Jupyter 信息模型
  - `config` - AppConfig 配置模型
  - `template` - Template 模板模型

### Requirement: State 模块职责边界
State 模块 SHALL 提供全局应用状态管理，使用线程安全的数据结构。

#### Scenario: AppStateWrapper 设计
- **WHEN** 管理全局状态
- **THEN** 必须使用 `Mutex<AppState>` 包装
- **AND** 提供线程安全的状态更新方法
- **AND** 所有方法应接受 `&self`（不可变引用）
- **AND** 内部通过 `self.0.lock()` 获取可变访问

#### Scenario: State 生命周期
- **WHEN** Tauri 应用启动
- **THEN** 通过 `.manage()` 注入 AppStateWrapper
- **AND** State 实例在整个应用生命周期内存在
- **AND** 可通过 Tauri 的 `State<T>` 在命令中访问

### Requirement: Templates 模块职责边界
Templates 模块 SHALL 负责环境模板解析和管理，不负责环境创建。

#### Scenario: 模板解析职责
- **WHEN** 解析模板文件
- **THEN** 负责 TOML 解析
- **AND** 负责 Python 版本提取
- **AND** 返回 Template 结构体

#### Scenario: 内置模板管理
- **WHEN** 提供内置模板
- **THEN** 使用 `include_str!` 嵌入模板文件
- **AND** 提供 `get_builtin_templates()` 函数
- **AND** 提供 `get_template_by_id()` 函数

#### Scenario: 模板与环境创建的边界
- **WHEN** 从模板创建环境
- **THEN** Templates 模块只提供模板信息
- **AND** Environment Domain 负责实际的创建逻辑
- **AND** 两者通过 Template 数据结构交互

### Requirement: Frontend 架构约束
Frontend SHALL 采用组件化设计，使用 Hooks 管理状态。

#### Scenario: 组件职责划分
- **WHEN** 实现 UI 组件
- **THEN** 组件应只负责 UI 渲染
- **AND** 业务逻辑应封装在 Hooks 中
- **AND** 状态应通过 props 或 context 传递

#### Scenario: Hooks 职责划分
- **WHEN** 实现 Hooks
- **THEN** 每个 Hook 应管理特定领域的状态
- **AND** 调用对应的 Tauri 命令
- **AND** 提供清晰的状态和操作接口

#### Scenario: 状态容器
- **WHEN** 需要跨组件共享状态
- **THEN** 应在 App.tsx 中维护状态
- **AND** 通过 props 传递给子组件
- **AND** 或通过 Context API 提供

### Requirement: 模块间通信约束
模块间通信 SHALL 通过明确定义的接口进行。

#### Scenario: Frontend 到 Backend 通信
- **WHEN** Frontend 需要调用 Backend 功能
- **THEN** 必须使用 Tauri 的 `invoke()` API
- **AND** 调用 API 层定义的命令
- **AND** 通过事件监听接收异步通知

#### Scenario: Domain 到 Infrastructure 通信
- **WHEN** Domain 层需要技术实现
- **THEN** 调用 Infrastructure 层提供的公共函数
- **AND** 通过参数传递配置和回调
- **AND** 不直接操作底层资源

#### Scenario: Domain 内部通信
- **WHEN** Domain 模块间需要协作
- **THEN** 通过公共接口调用
- **AND** 可以直接使用其他 Domain 模块导出的函数
- **AND** 保持模块职责清晰

### Requirement: 数据流向约束
数据流 SHALL 遵循单向数据流原则。

#### Scenario: 创建环境数据流
- **WHEN** 用户创建环境
- **THEN** 数据流遵循以下路径：
  1. Frontend: `useEnvironment.createEnvironment()`
  2. Tauri IPC: `invoke('create_environment', args)`
  3. API Layer: `api::env_commands::create_environment()`
  4. Domain Layer: `domain::environment::create_environment()`
  5. Infrastructure: `uv::run_uv_command()`, `paths::get_env_dir()`
  6. 返回结果沿相同路径反向传递

#### Scenario: 状态更新数据流
- **WHEN** Backend 状态变化需要通知 Frontend
- **THEN** 使用 Tauri 事件机制
- **AND** Frontend 通过 `listen()` 监听事件
- **AND** 更新本地状态

### Requirement: 错误处理边界
错误处理 SHALL 在模块边界进行统一处理。

#### Scenario: Infrastructure 层错误处理
- **WHEN** Infrastructure 层发生错误
- **THEN** 返回 `Result<T, String>` 类型
- **AND** 错误消息应清晰描述技术问题
- **AND** 不包含业务上下文（由上层添加）

#### Scenario: Domain 层错误处理
- **WHEN** Domain 层发生错误
- **THEN** 包装 Infrastructure 层的错误
- **AND** 添加业务上下文
- **AND** 返回用户友好的错误消息

#### Scenario: API 层错误处理
- **WHEN** API 层返回错误
- **THEN** 错误消息应可直接展示给用户
- **AND** 必要时包含调试信息
- **AND** 使用一致的错误格式

### Requirement: 测试边界约束
测试 SHALL 遵循模块边界进行单元测试和集成测试。

#### Scenario: Domain 层测试
- **WHEN** 测试 Domain 层逻辑
- **THEN** 应使用 mock 替代 Infrastructure 层实现
- **AND** 测试业务逻辑的正确性
- **AND** 不依赖外部资源（文件系统、网络等）

#### Scenario: Infrastructure 层测试
- **WHEN** 测试 Infrastructure 层
- **THEN** 可以使用临时目录和测试资源
- **AND** 测试技术实现的正确性
- **AND** 不依赖 Domain 层逻辑

#### Scenario: API 层集成测试
- **WHEN** 测试 API 层
- **THEN** 应测试完整的调用链
- **AND** 使用真实的 Domain 和 Infrastructure 层
- **AND** 验证端到端功能

### Requirement: 文档和注释边界
代码文档 SHALL 在模块公共接口处提供详细说明。

#### Scenario: 公共函数文档
- **WHEN** 定义模块的公共函数
- **THEN** 应提供文档注释
- **AND** 说明函数的职责
- **AND** 说明参数和返回值
- **AND** 说明可能的错误情况

#### Scenario: 模块级文档
- **WHEN** 定义模块
- **THEN** 应在模块顶部提供模块级文档
- **AND** 说明模块的整体职责
- **AND** 说明与相关模块的关系

#### Scenario: 内部实现注释
- **WHEN** 实现内部逻辑
- **THEN** 复杂逻辑应提供注释说明
- **AND** 避免冗余注释
- **AND** 代码应自解释