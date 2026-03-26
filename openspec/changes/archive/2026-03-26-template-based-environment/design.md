## Context

当前 PyForge 使用固定的 `create_default_environment` 函数在首次启动时创建一个名为 `default` 的 Python 环境，包含硬编码的包列表（numpy, pandas, matplotlib, ipykernel）。这个实现在 `src-tauri/src/domain/environment/creator.rs` 中。

现有架构：
- **前端**：React + TypeScript，首次启动直接调用 `initialize_app` API
- **后端**：Rust + Tauri 2.0，使用 uv 作为 Python 包管理器
- **环境创建**：通过 `create_environment` 函数，指定名称、Python 版本和包列表
- **环境存储**：`~/.pyforge/env/<env-id>/`

约束：
- 必须使用 `nix develop` 激活开发环境
- 新手用户不需要理解环境概念
- 需要保持向后兼容（老用户的 default 环境不受影响）

## Goals / Non-Goals

**Goals:**
- 实现基于模板的环境创建系统，使用标准的 pyproject.toml 格式
- 在首次启动时显示友好的模板选择界面
- 将模板定义编译进二进制，避免外部依赖
- 保持简单的实现，不引入复杂的更新机制

**Non-Goals:**
- 模板自动更新系统（模板固定在应用版本中）
- 用户自定义模板（未来可扩展）
- 远程模板仓库或 CDN
- 多环境管理（首次仅创建一个环境）

## Decisions

### 1. 模板定义格式：pyproject.toml

**决策**：使用 Python 标准的 pyproject.toml 格式定义模板

**理由**：
- 符合 Python 生态最佳实践
- 支持标准的依赖版本约束（PEP 440）
- 可读性好，易于维护
- 未来可以导出为独立的 Python 项目

**模板文件结构**：
```toml
[project]
name = "data-science"              # 环境名称（将创建为 env-id）
description = "数据分析环境"
requires-python = ">=3.11"
dependencies = [
    "numpy>=1.24.0",
    "pandas>=2.0.0",
    "matplotlib>=3.7.0",
    "ipykernel>=6.0.0",
]

[tool.pyforge]
display-name = "数据分析"           # 显示名称（中文）
icon = "📊"                        # 表情符号图标
use-cases = ["数据处理", "可视化图表", "统计分析"]
```

**替代方案**：
- JSON/YAML：不够标准，无法直接复用于 Python 项目
- Rust 结构体：硬编码，不易维护

### 2. 模板存储方式：编译进二进制

**决策**：使用 `include_str!` 宏将 TOML 文件编译进 Rust 二进制

**理由**：
- 零外部依赖，应用启动速度快
- 无法被用户意外修改
- 打包后单个可执行文件，便于分发
- 符合桌面应用的打包惯例

**实现**：
```rust
// src-tauri/src/templates/mod.rs
const DATA_SCIENCE: &str = include_str!("../../templates/data-science.toml");
const MACHINE_LEARNING: &str = include_str!("../../templates/machine-learning.toml");
// ...
```

**文件位置**：
```
src-tauri/
├── templates/
│   ├── data-science.toml
│   ├── machine-learning.toml
│   ├── web-development.toml
│   └── general-learning.toml
```

**替代方案**：
- 打包到资源目录：需要配置路径，可能有路径问题
- 远程下载：首次启动慢，需要网络连接

### 3. 环境名称使用模板的 [project.name]

**决策**：环境的目录名和 ID 使用模板 `[project.name]` 字段

**理由**：
- 环境名称具有语义（data-science vs default）
- 与模板定义一致，易于理解
- 未来支持多环境时便于区分

**实现**：
```rust
let env_id = template.name;  // "data-science"
let env_dir = get_env_dir(&env_id);  // ~/.pyforge/env/data-science/
```

**替代方案**：
- 保持使用 `default`：无法区分模板，失去语义

### 4. 首次启动流程：检查环境列表

**决策**：在前端检查 `environments.length === 0` 决定是否显示模板选择

**理由**：
- 逻辑简单，无需后端新增状态
- 与现有的环境列表检查机制一致
- 可以在复用环境的情况下跳过模板选择（开发便利）

**实现**：
```typescript
const envs = await listEnvironments();
if (envs.length === 0) {
  setShowTemplateSelection(true);
}
```

**替代方案**：
- 后端添加 "has_completed_onboarding" 标记：增加状态管理复杂度

### 5. 环境创建 API：新增 `create_environment_from_template`

**决策**：新增专门的 API 负责从模板创建环境

**理由**：
- 职责单一，`create_environment` 保持通用性
- 可以在创建后自动设置 `is_default`
- 便于未来扩展（如模板版本管理）

**签名**：
```rust
#[tauri::command]
pub async fn create_environment_from_template(
    app: tauri::AppHandle,
    template_id: String,
) -> Result<Environment, String>
```

**流程**：
1. 根据 `template_id` 查找模板定义
2. 解析 pyproject.toml 获取依赖列表
3. 调用 `create_environment_impl` 创建环境
4. 更新 metadata，将新环境标记为 `is_default: true`

### 6. 依赖解析：直接传递给 uv

**决策**：不实现自己的依赖解析，直接将版本约束传递给 uv

**理由**：
- uv 完全支持 PEP 440 版本规范
- 避免重复造轮轮
- 减少维护负担

**实现**：
```rust
// 将 "numpy>=1.24.0,<2.0.0" 直接传递给 uv
let args = vec![
    "pip", "install", "--python", &python_path,
    "numpy>=1.24.0,<2.0.0",
];
run_uv_command(&app, &args).await?;
```

### 7. 模板列表 API：`list_templates`

**决策**：新增 Tauri command 返回模板列表给前端

**理由**：
- 前端需要显示模板卡片
- 模板定义在后端，前端不应硬编码
- 保持单一数据源

**返回结构**：
```rust
pub struct Template {
    pub id: String,           // "data-science"
    pub display_name: String,  // "数据分析"
    pub description: String,
    pub icon: String,         // "📊"
    pub dependencies: Vec<String>,
    pub use_cases: Vec<String>,
}
```

## Risks / Trade-offs

### Risk 1: 模板固定在应用版本中

**风险**：模板依赖更新需要发布新版本

**缓解**：
- 使用宽松的版本约束（`>=1.24.0,<2.0.0`）减少更新频率
- 在文档中说明模板版本策略
- 未来可以添加"检查更新"功能（非 MVP）

### Risk 2: 环境名称变化可能影响用户脚本

**风险**：用户可能依赖 `default` 环境名称

**缓解**：
- 只影响新用户，老用户不受影响
- 在文档中说明环境命名规则
- 提供环境重命名功能（未来）

### Risk 3: toml 解析失败

**风险**：pyproject.toml 格式错误导致应用崩溃

**缓解**：
- 编译时验证（使用 `include_str!` 在编译期读取）
- 添加解析错误的友好提示
- 提供默认模板作为兜底

### Risk 4: 依赖版本冲突

**风险**：不同模板的依赖版本可能不一致

**缓解**：
- 每个模板独立环境，不会冲突
- 使用版本约束避免安装不兼容的版本
- uv 会自动处理依赖解析

### Trade-off: 简化 vs 灵活性

**权衡**：简化实现（固定模板） vs 用户灵活性（自定义模板）

**平衡**：
- MVP 仅支持内置模板
- 保留扩展点（用户模板目录 `~/.pyforge/user-templates/`）
- 优先满足 80% 用户需求

## Migration Plan

### 开发阶段

1. **创建模板文件**
   - 创建 `src-tauri/templates/` 目录
   - 编写 4 个 pyproject.toml 文件

2. **实现后端支持**
   - 添加 `toml` crate 依赖
   - 实现 `models/template.rs`
   - 实现 `templates/mod.rs`
   - 添加 Tauri commands

3. **实现前端界面**
   - 创建 `TemplateSelectionScreen.tsx`
   - 修改 `App.tsx` 初始化流程
   - 连接 API 调用

4. **测试**
   - 清空 `~/.pyforge/env/` 测试首次启动
   - 验证每个模板的环境创建
   - 检查 `is_default` 标记

### 部署阶段

1. **版本发布**
   - 语义化版本（Minor 版本：0.2.0）
   - 更新 CHANGELOG

2. **用户升级**
   - 老用户：无影响，保持现有 `default` 环境
   - 新用户：看到模板选择界面

### 回滚策略

- 保留 `create_default_environment` 函数作为 fallback
- 添加配置项禁用模板系统（环境变量）
- 如果模板解析失败，回退到固定 default 环境

## Open Questions

1. **模板是否支持可选依赖？**
   - 当前：不支持，仅使用 `dependencies`
   - 未来：支持 `project.optional-dependencies`

2. **是否需要模板预览？**
   - 当前：仅显示包名称列表
   - 未来：显示包的详细描述和用途

3. **首次启动后能否更改模板？**
   - 当前：不支持，环境创建后无法更改模板
   - 未来：提供"基于新模板重新创建环境"功能

4. **是否支持跳过模板选择？**
   - 当前：不支持，必须选择模板
   - 未来：添加"使用默认配置"按钮（创建 general-learning）
