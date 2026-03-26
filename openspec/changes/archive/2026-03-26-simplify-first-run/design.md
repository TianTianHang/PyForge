## Context

当前首次启动流程：TemplateSelectionScreen(选模板) → 创建环境 → setAppState("select_project") → ProjectPanel → WelcomeGuide(又展示 4 个相同模板卡片) → 用户手动创建项目 → 启动 Jupyter。

核心问题：用户选模板创建环境后，被要求再做一次几乎相同的操作，且必须手动创建项目才能开始使用。

现有代码中 `handleTemplateComplete()` (App.tsx:110-114) 完成后仅调用 `listEnvironments()` 然后设置 `select_project` 状态。WelcomeGuide (WelcomeGuide.tsx) 使用前端 `PROJECT_TEMPLATES` 常量渲染 4 个模板卡片，点击后打开 CreateProjectDialog。Rust 端 `create_environment_from_template` 已将新环境标记为 `is_default = true`。

## Goals / Non-Goals

**Goals:**
- 首次用户选模板后自动创建默认项目并自动启动 Jupyter，实现一步到位
- WelcomeGuide 改为简单空状态提示，去掉模板卡片
- 清理不再使用的 `constants/templates.ts` 和 `QuickStartCard.tsx`

**Non-Goals:**
- 不改 Rust 后端逻辑
- 不改 TemplateSelectionScreen 组件
- 不合并环境和项目概念
- 不实现老用户"自动进入上次项目"功能
- 不改 `CreateProjectDialog` 或 `ProjectList` 组件

## Decisions

### D1: 通过 `is_default` 标识获取新建环境 ID

**选择**: `handleTemplateComplete` 调用 `listEnvironments()` 后从返回数组中找到 `is_default === true` 的环境。

**替代方案**: 修改 `TemplateSelectionScreen` 的 `onComplete` 回调返回 Environment 对象。

**理由**: `create_environment_from_template` (template_commands.rs:28-34) 已将新环境标记为 `is_default = true`，无需修改任何现有接口，前端改动最小。

### D2: 自动创建的项目名使用环境显示名

**选择**: `createProject(env.display_name, env.id)`，项目名与环境模板显示名一致。

**替代方案**: 使用固定名称如"我的第一个项目"。

**理由**: 模板显示名（如"数据分析"）对新手更有意义，且与已选模板保持一致。

### D3: WelcomeGuide 改为内联空状态而非删除

**选择**: 保留 WelcomeGuide 组件，将其重构为简单空状态（图标 + 提示文字）。

**替代方案**: 完全删除 WelcomeGuide，在 ProjectPanel 中直接写空状态。

**理由**: ProjectPanel 中已有条件渲染逻辑 `projects.length > 0 ? <ProjectList> : <WelcomeGuide>`，保留组件接口只改内部实现，改动更小更安全。

### D4: 删除前端模板常量和卡片组件

**选择**: 删除 `src/constants/templates.ts` 和 `src/components/QuickStartCard.tsx`。

**理由**: 这两个仅被 WelcomeGuide 使用。模板数据已由 Rust 端 TOML 文件管理（`src-tauri/src/templates/*.toml`），前端不存在其他引用。

## Risks / Trade-offs

- **[环境列表竞态]** `listEnvironments` 返回时 `is_default` 可能尚未更新 → 使用 `await listEnvironments()` 确保顺序执行，且 `create_environment_from_template` 是 await 完成后才调用 onComplete
- **[createProject 失败]** 自动创建项目失败会导致用户停留在加载中状态 → 在 handleTemplateComplete 中添加 catch，失败时回退到 `select_project` 状态，让用户手动创建
- **[display_name 可能是模板 id]** 需确认 listEnvironments 返回的对象包含 display_name 字段 → `Environment` 类型中有 `display_name` 属性（由 metadata 提供）
