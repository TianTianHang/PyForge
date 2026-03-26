## Why

首次用户在 TemplateSelectionScreen 选模板创建环境后，进入 ProjectPanel 的 WelcomeGuide 又展示了相同的 4 个模板卡片（PROJECT_TEMPLATES），造成认知混乱和重复操作。用户还需要手动创建项目才能开始使用 Jupyter，对新手不够友好。应简化为"选模板 → 自动创建默认项目 → 自动启动 Jupyter → 直接进入 JupyterLab"的流畅体验。

## What Changes

- 首次用户选完模板创建环境后，系统自动创建一个默认项目并直接启动 Jupyter，跳过 ProjectPanel/WelcomeGuide 中间步骤
- WelcomeGuide 去掉模板卡片，改为简单空状态提示（图标 + "还没有项目" + 引导文字），仅对已删光项目的老用户可见
- 删除不再使用的前端模板常量（`constants/templates.ts`）和模板卡片组件（`QuickStartCard.tsx`）

## Capabilities

### New Capabilities

_(无新增能力)_

### Modified Capabilities

- `template-selection-ui`: 环境创建完成后的导航目标从 select_project 改为自动创建项目+启动 Jupyter
- `quick-start-ux`: 首次用户路径从"选模板→创建环境→手动建项目→启动"简化为"选模板→自动完成→进入 Jupyter"；空状态从模板卡片改为简单提示
- `onboarding-mode`: WelcomeGuide 不再展示模板卡片，改为简单空状态提示；first-time 用户不再经过 select_project 状态

## Impact

- **前端**: `App.tsx`（handleTemplateComplete 逻辑变更）、`WelcomeGuide.tsx`（重构为空状态）、`ProjectPanel.tsx`（props 调整）
- **删除文件**: `src/constants/templates.ts`、`src/components/QuickStartCard.tsx`
- **Rust 后端**: 无改动
- **现有 spec 冲突**: `quick-start-ux` 中 "First-time user path: 2 clicks to Jupyter" 场景实际应为 1 次（选模板后系统自动完成剩余步骤）；`onboarding-mode` 中 WelcomeGuide 展示模板卡片的需求被替代
