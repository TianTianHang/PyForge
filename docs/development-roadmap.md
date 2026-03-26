# 开发路线图

## 项目概述

PyForge 采用分阶段开发策略，优先实现核心功能，逐步扩展高级特性，确保每个阶段都有可交付的价值。

## 当前进度

| 阶段 | 状态 | 版本 | 说明 |
|------|------|------|------|
| 基础环境 | ✅ 已完成 | v0.1.0 | Base 环境 + 默认环境 |
| 多环境管理 | ✅ 已完成 | v0.2.0 | 多环境支持、包管理、项目绑定 |
| 项目管理 | ⏳ 计划中 | v0.3.0 | 多项目、导入导出 |
| 用户体验优化 | ⏳ 计划中 | v0.4.0 | 防炸盾、时光机、模板库 |
| 高级特性 | ⏳ 计划中 | v1.0.0 | GPU、智能补全、云端同步 |

## 阶段划分

### 第一阶段：基础环境 - 已完成

**目标**：建立 PyForge 的核心运行环境

#### 1.1 Base 环境构建 - 已完成

- [x] **Base 环境**
  - 位于 ~/.pyforge/base/
  - 仅安装 JupyterLab，所有项目共享

- [x] **默认环境构建**
  - Python 3.12 (uv 创建的虚拟环境)
  - 预装：numpy, pandas, matplotlib, ipykernel
  - 不包含 JupyterLab（由 base 环境提供）

- [x] **首次启动流程**
  - 应用初始化 (initialize_app)
  - 自动创建 base 环境（如不存在）
  - 自动创建 default 环境（如不存在）
  - 注册为 Jupyter kernel

#### 1.2 Jupyter 集成 - 已完成

- [x] **Jupyter Server 管理**
  - 启动/停止服务
  - 自动寻找可用端口
  - 统一使用 base 环境的 python -m jupyter lab
  - 配置 kernel_dirs

- [x] **WebView 嵌入**
  - JupyterLab 前端嵌入 Tauri WebView
  - 跨域和通信配置

#### 1.3 前端界面 - 已完成

- [x] **状态管理**
  - 环境检查状态
  - Jupyter 连接状态
  - 错误处理和重试

- [x] **屏幕组件**
  - LoadingScreen - 加载状态
  - WelcomeScreen - 首次启动引导
  - ProgressScreen - 环境创建进度
  - ErrorScreen - 错误提示
  - JupyterViewer - JupyterLab 嵌入

#### 1.4 代码架构 - 已完成

- [x] **后端模块化**
  - api/ - Tauri 命令接口
  - domain/ - 业务逻辑
  - infrastructure/ - 基础设施
  - models/ - 数据模型
  - state/ - 应用状态

- [x] **前端模块化**
  - hooks/ - 业务逻辑钩子
  - components/ - UI 组件
  - types/ - TypeScript 类型

**里程碑**：MVP 已完成，包含开箱即用的 Jupyter 环境

---

### 第二阶段：多环境管理 - 进行中

**目标**：支持多个 Python 环境，实现项目-环境绑定

**设计文档**：`openspec/changes/add-multi-env-management/`

#### 2.1 数据模型扩展 (Phase 1)

- [ ] **Environment 模型**
  - id, name, python_version, path
  - kernel_name, created_at, is_default
  - 序列化/反序列化

- [x] **目录结构迁移**
  - `~/.pyforge/env/` → `~/.pyforge/envs/default/`
  - `~/.pyforge/project/` → `~/.pyforge/projects/`
  - `~/.pyforge/base/` - 新增 base 环境
  - `~/.pyforge/kernels/` - 新增全局内核存储
  - 自动迁移逻辑

- [ ] **环境元数据**
  - `~/.pyforge/.envs-metadata.json`
  - 环境列表索引
  - 持久化存储

#### 2.2 后端 Tauri 命令 (Phase 2)

- [ ] **环境管理命令**
  - `list_environments` - 获取所有环境
  - `create_environment` - 创建新环境
  - `delete_environment` - 删除环境

- [ ] **包管理命令**
  - `list_packages` - 获取环境的包列表
  - `install_package` - 安装包
  - `uninstall_package` - 卸载包

- [ ] **内核管理**
  - 创建环境时自动注册内核
  - 删除环境时自动注销内核
  - 内核命名：`pyforge-{env-name}`

#### 2.3 前端界面 (Phase 3-5)

- [ ] **环境列表页面**
  - 环境卡片展示
  - 环境详情面板
  - 创建/删除操作

- [ ] **包管理界面**
  - 已安装包列表
  - 包搜索和安装
  - 包卸载确认

- [ ] **创建环境向导**
  - 选择 Python 版本
  - 输入环境名称
  - 预装包选择
  - 创建进度显示

- [ ] **集成到主流程**
  - 修改启动逻辑（多环境支持）
  - 项目-环境绑定 UI
  - 内核切换集成

#### 2.4 测试与发布 (Phase 7)

- [ ] **功能测试**
  - 环境 CRUD 测试
  - 包管理测试
  - 迁移逻辑测试

- [ ] **集成测试**
  - 多环境切换测试
  - Jupyter 内核切换测试
  - 项目-环境绑定测试

**里程碑**：发布 v0.2.0，包含多环境管理功能

---

### 第三阶段：用户体验优化（后续版本）

**目标**：提升用户体验，增加安全保护功能

**计划功能**：

- [ ] **防炸盾**
  - CPU 时间限制（30 秒超时）
  - 内存使用限制（1GB）
  - 超时熔断机制

- [ ] **本地时光机**
  - 代码历史回溯
  - 版本对比
  - 自动快照

- [ ] **多环境管理**
  - 环境商店界面
  - 环境创建/删除
  - 项目绑定环境

- [ ] **项目导入导出**
  - 项目打包 (zip)
  - 项目解包/恢复

- [ ] **示例代码/模板库**
  - Hello World 示例
  - 数据分析入门模板
  - 常用代码片段

- [ ] **环境健康检测**
  - 环境损坏检测
  - 一键修复功能

---

### 第三阶段：高级特性（更远未来）

**目标**：扩展高级功能，支持更广泛的使用场景

**计划功能**：

- [ ] GPU 环境配置（CUDA 自动检测与安装）
- [ ] 智能代码补全
- [ ] 学习进度追踪
- [ ] 云端同步（可选）
