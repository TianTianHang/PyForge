## Why

当前 PyForge 在首次启动时自动创建固定的 `default` 环境，使用硬编码的包列表（numpy, pandas, matplotlib, ipykernel）。这种"一刀切"的方式无法满足不同学习场景的需求：

- **数据分析用户**需要 pandas 和 matplotlib
- **机器学习用户**需要 scikit-learn
- **Web 开发用户**需要 flask
- **Python 初学者**只需要基础的 ipykernel 和 jupyterlab

同时，新手用户被迫理解"环境"概念，增加了学习门槛。用户真正关心的是"我想做什么"（用途），而不是"我需要哪些包"（技术配置）。

## What Changes

- **取消固定的 default 环境自动创建**：首次启动不再创建硬编码的 default 环境
- **新增模板选择界面**：首次启动时显示模板选择卡片，用户基于用途选择
- **使用 pyproject.toml 定义模板**：4 个内置模板（data-science, machine-learning, web-development, general-learning）
- **模板驱动环境创建**：根据选择的模板创建环境，使用模板中定义的包列表
- **创建的环境标记为 default**：通过模板创建的第一个环境自动标记为 `is_default: true`
- **模板编译进二进制**：使用 `include_str!` 宏将模板 TOML 文件编译进 Rust 二进制

**BREAKING**: 现有用户的 `default` 环境不受影响（不考虑老用户迁移），但新用户的环境名称将基于模板（如 `data-science` 而不是 `default`）。

## Capabilities

### New Capabilities

- `template-based-environment-creation`: 模板驱动的环境创建系统，支持从 pyproject.toml 读取模板定义并创建对应的 Python 环境

- `template-selection-ui`: 首次启动时的模板选择界面，显示卡片式模板列表供用户选择

### Modified Capabilities

- `environment-management`: 环境创建流程修改，支持从模板创建并标记 default 环境的机制

## Impact

**前端组件**：
- 新增 `TemplateSelectionScreen.tsx`: 模板选择界面
- 修改 `App.tsx`: 首次启动流程，无环境时显示模板选择
- 修改 `ProgressScreen.tsx`: 复用现有进度显示（可能不需要修改）

**后端模块**：
- 新增 `src-tauri/src/models/template.rs`: 模板数据结构
- 新增 `src-tauri/src/templates/mod.rs`: 模板加载和解析逻辑
- 修改 `src-tauri/src/api/env_commands.rs`: 新增 `create_environment_from_template` API
- 新增 `src-tauri/src/api/template_commands.rs`: 模板相关 API（list_templates）

**模板文件**：
- 新增 `src-tauri/templates/data-science.toml`: 数据分析模板定义
- 新增 `src-tauri/templates/machine-learning.toml`: 机器学习模板定义
- 新增 `src-tauri/templates/web-development.toml`: Web 开发模板定义
- 新增 `src-tauri/templates/general-learning.toml`: 通用学习模板定义

**环境结构变化**：
```
之前: ~/.pyforge/env/default/
之后: ~/.pyforge/env/data-science/ (或其他模板名)
```

**数据模型**：
- 修改 `Environment` metadata: 添加 `template_id` 字段记录来源模板
- `is_default` 标记机制保持不变，但应用于模板创建的环境

**依赖项**：
- Rust: 新增 `toml` crate 用于解析 pyproject.toml

**用户流程变化**：
```
之前: 启动应用 → 自动创建 default 环境 → 项目界面
之后: 启动应用 → 选择模板 → 创建模板环境 → 项目界面
```
