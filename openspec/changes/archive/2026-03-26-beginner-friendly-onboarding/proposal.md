## Why

PyForge 的目标用户是 Python 学习者，但当前的项目创建和启动流程对新手存在较高的认知门槛。用户需要理解"项目"和"环境"的关系，首次启动需要进行多项技术决策（Python 版本、包选择），且进入 Jupyter 需要多步操作。这种复杂度阻碍了新手快速上手，违背了"零配置学习环境"的产品定位。

## What Changes

- **简化项目创建流程**：新增新手引导模式，隐藏环境选择等复杂配置，提供智能默认值
- **一键启动 Jupyter**：项目卡片直接显示启动按钮，移除"选中→再点击"的两步操作
- **项目模板系统**：提供预配置的项目模板（数据分析、机器学习、Web 开发等），基于用途引导而非技术配置
- **渐进式功能披露**：根据用户经验水平（新手/标准/高级）动态展示界面元素
- **优化空状态体验**：提供清晰的"快速开始"路径而非空白页

## Capabilities

### New Capabilities
- `onboarding-mode`: 新手引导模式，包括首次启动欢迎页和简化版创建对话框
- `project-templates`: 项目模板系统，提供预配置的用途模板和智能默认值
- `quick-start-ux`: 快速启动体验优化，包括一键启动和操作流程简化
- `progressive-disclosure`: 渐进式功能披露，根据用户状态动态展示功能

### Modified Capabilities
- `project-creation-atomic`: 扩展现有项目创建规格，增加模板选择和简化流程场景

## Impact

**前端组件修改**：
- `CreateProjectDialog.tsx`: 增加模板选择、高级选项折叠、用途引导
- `ProjectPanel.tsx`: 添加用户模式检测、空状态优化
- `ProjectList.tsx`: 卡片式设计、直接启动按钮、视觉引导增强
- 新增 `WelcomeScreen.tsx` 或首次启动引导组件

**状态管理**：
- 新增用户经验状态（first-time / beginner / standard / advanced）
- 模板配置数据结构
- 创建流程状态机扩展

**无破坏性变更**：所有改进向后兼容，现有功能和高级配置选项保留
