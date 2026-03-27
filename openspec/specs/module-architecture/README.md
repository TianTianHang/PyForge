# Module Architecture

## Overview

This specification defines the module boundaries and architectural constraints for PyForge. The system follows a layered architecture with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (React)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Components  │  │    Hooks     │  │    Types     │     │
│  │  (UI渲染)     │  │  (状态管理)   │  │  (类型定义)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │ Tauri IPC (invoke/listen)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Tauri Commands)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │env_commands  │  │project_cmd   │  │jupyter_cmd   │     │
│  │(协议转换)     │  │(参数验证)     │  │(序列化)       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │ 函数调用
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Domain Layer (Business Logic)             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Environment Domain                                    │  │
│  │  ├─ creator: 创建环境                                   │  │
│  │  ├─ deleter: 删除环境                                   │  │
│  │  ├─ kernel_links: 内核绑定                              │  │
│  │  └─ package_manager: 包管理                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Project Domain                                        │  │
│  │  ├─ creator: 创建项目                                   │  │
│  │  └─ deleter: 删除项目                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Jupyter Domain                                        │  │
│  │  ├─ launcher: 启动服务                                  │  │
│  │  ├─ terminator: 停止服务                                │  │
│  │  └─ base_env: Base 环境管理                             │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ 依赖技术服务
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Infrastructure Layer (Technical Services)       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    paths     │  │    config    │  │   metadata   │     │
│  │  (路径管理)   │  │  (配置管理)   │  │  (元数据)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │      uv      │  │   process    │  │     util     │     │
│  │  (uv执行)     │  │  (进程管理)   │  │  (工具函数)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Support Modules                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Models    │  │    State     │  │  Templates   │     │
│  │  (数据结构)   │  │  (全局状态)   │  │  (模板解析)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Key Principles

### 1. Layered Architecture
- **Frontend** → **API** → **Domain** → **Infrastructure**
- Upper layers depend on lower layers, never the reverse
- Each layer has well-defined responsibilities

### 2. Module Boundaries

| Layer | Responsibility | Forbidden Actions |
|-------|---------------|-------------------|
| **API** | Protocol conversion, validation | Business logic, file operations |
| **Domain** | Business logic, domain rules | Technical implementations, direct file I/O |
| **Infrastructure** | Technical services, utilities | Business logic, business context |
| **Models** | Data structures, serialization | Business methods, logic |
| **State** | Global state management | Business logic |
| **Templates** | Template parsing | Environment creation |

### 3. Communication Patterns

- **Frontend ↔ Backend**: Tauri IPC (invoke/listen)
- **Domain ↔ Infrastructure**: Function calls with parameters
- **Domain Internal**: Direct function calls
- **Cross-cutting**: Models, State

### 4. Data Flow

```
User Action → Hook → invoke() → API Layer → Domain Layer → Infrastructure
                                   ↓              ↓              ↓
                                Validate      Business Logic   Execute
                                   ↓              ↓              ↓
                                Result ← ← ← ← Result ← ← ← ← Result
```

## Module Responsibilities

### API Layer Submodules
- `env_commands` - Environment CRUD operations
- `project_commands` - Project management and kernel binding
- `jupyter_commands` - Jupyter server lifecycle
- `config_commands` - Global configuration
- `template_commands` - Template queries
- `state_commands` - Application state queries

### Domain Layer Submodules

#### Environment Domain
- `creator` - Create virtual environments with uv
- `deleter` - Delete environments and cleanup
- `lister` - Query environment list
- `verifier` - Validate environment integrity
- `kernel` - Register/unregister Jupyter kernels
- `kernel_links` - Manage kernel-project bindings (symlinks)
- `package_manager` - Install/uninstall/list packages

#### Project Domain
- `creator` - Create project directories
- `deleter` - Delete projects
- `lister` - List projects

#### Jupyter Domain
- `launcher` - Start JupyterLab server
- `terminator` - Stop JupyterLab server
- `base_env` - Ensure base environment exists

### Infrastructure Layer Submodules

#### Core Infrastructure
- `paths` - All path definitions and directory management
- `config` - Load/save global configuration
- `metadata` - Manage environments.json and projects.json
- `util` - Port detection, token generation, path utilities
- `constants` - Application constants

#### Python Environment
- `uv` - Execute uv sidecar commands
- `uv_config` - Generate uv configuration files
- `process` - Process lifecycle (kill gracefully/forcefully)

#### Data Management
- `migration` - MVP data migration
- `data_migration` - Data directory migration
- `dir_validator` - Validate directory permissions

### Support Modules

#### Models
- `app` - AppState
- `env` - Environment, EnvStatus, InstalledPackage
- `project` - Project
- `jupyter` - JupyterInfo, JupyterServerConfig
- `config` - AppConfig and sub-configs
- `template` - Template

#### State
- `AppStateWrapper` - Thread-safe global state container

#### Templates
- Template parsing and built-in templates

## Dependency Rules

### Allowed Dependencies

```
Frontend → API (via IPC)
API → Domain
API → State
Domain → Infrastructure
Domain → Models
Domain → State
Infrastructure → Models
State → Models
Templates → Models
```

### Forbidden Dependencies

```
Domain → API (❌)
Infrastructure → Domain (❌)
Models → Any Layer (❌)
State → Domain (❌)
Templates → Domain (❌)
```

## Testing Strategy

### Unit Tests
- **Domain Layer**: Mock Infrastructure, test business logic
- **Infrastructure Layer**: Use temp directories, test technical implementation

### Integration Tests
- **API Layer**: Test complete call chain with real implementations

### Test Isolation
- Each layer tested in isolation
- Mock external dependencies
- No reliance on production resources

## Error Handling

### Error Flow

```
Infrastructure Error (technical)
    ↓ wrap with context
Domain Error (business context)
    ↓ format for user
API Error (user-friendly message)
    ↓ serialize
Frontend Error (display to user)
```

## When to Add New Modules

### New API Command
1. Identify the correct `*_commands` module
2. If none fits, create new command module
3. Keep command thin, delegate to Domain

### New Domain Logic
1. Identify the correct Domain (Environment/Project/Jupyter)
2. If new domain, create new Domain module
3. Define clear responsibilities and interfaces

### New Infrastructure Service
1. Identify if it's core, Python-related, or data-related
2. Place in appropriate Infrastructure submodule
3. Keep it reusable and business-agnostic

## See Also

- [spec.md](./spec.md) - Full specification with requirements and scenarios
- [../environment-management/](../environment-management/) - Environment domain details
- [../path-management/](../path-management/) - Path management details