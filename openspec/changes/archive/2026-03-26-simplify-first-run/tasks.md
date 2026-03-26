## 1. 首次用户自动进入 Jupyter

- [x] 1.1 修改 `App.tsx` `handleTemplateComplete()`: 调用 `listEnvironments()` 后从返回值中找到 `is_default === true` 的环境
- [x] 1.2 在 `handleTemplateComplete()` 中调用 `createProject(env.display_name, env.id)` 自动创建默认项目
- [x] 1.3 在 `handleTemplateComplete()` 中调用 `listProjects()` 刷新项目列表，找到刚创建的项目
- [x] 1.4 在 `handleTemplateComplete()` 中调用 `handleStartJupyter(project.id)` 自动启动 Jupyter 并进入 JupyterLab
- [x] 1.5 为 `handleTemplateComplete()` 添加错误处理：createProject 或 startJupyter 失败时回退到 `select_project` 状态

## 2. WelcomeGuide 改为简单空状态

- [x] 2.1 重构 `WelcomeGuide.tsx`: 去掉 PROJECT_TEMPLATES 和 QuickStartCard 的 import
- [x] 2.2 替换模板卡片网格为简单空状态：文件夹图标 + "还没有项目" + "点击右上角「新建项目」按钮创建你的第一个项目" 提示文字
- [x] 2.3 更新 WelcomeGuide props: 去掉 `onSelectTemplate` prop
- [x] 2.4 更新 `ProjectPanel.tsx`: 移除传递给 WelcomeGuide 的 `onSelectTemplate` prop 及相关状态（`selectedTemplate`）

## 3. 清理无用代码

- [x] 3.1 删除 `src/constants/templates.ts`（重构 TemplateSelector 和 CreateProjectDialog 使用 Rust list_templates 后删除）
- [x] 3.2 删除 `src/components/QuickStartCard.tsx`
- [x] 3.3 检查并清理其他文件中对 templates.ts 和 QuickStartCard 的 import 引用
