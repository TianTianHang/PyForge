# 架构设计

## 系统概述

PyForge是一个纯桌面应用，基于Tauri框架构建，为Python开发者提供完整的本地开发环境。

## 实现状态

| 模块 | 状态 | 版本 | 说明 |
|------|------|------|------|
| 环境管理 | ✅ MVP 完成 | v0.1.0 | 单环境、自动创建 |
| Jupyter 集成 | ✅ MVP 完成 | v0.1.0 | Server 管理、WebView 嵌入 |
| 前端界面 | ✅ MVP 完成 | v0.1.0 | React + TypeScript |
| 多环境管理 |   进行中 | v0.2.0 | OpenSpec 已规划 |
| 项目管理 |   进行中 | v0.2.0 | 多项目、导入导出 |
| 安全防护 | ⏳ 计划中 | v0.3.0 | 防炸盾、资源限制 |

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      PyForge 桌面应用                        │
├─────────────────────────────────────────────────────────────┤
│  前端界面 (WebView)                                          │
│  ├─ Jupyter Notebook/Lab 界面                               │
│  ├─ 环境管理界面                                             │
│  └─ 内核状态监控                                             │
├─────────────────────────────────────────────────────────────┤
│  Tauri 命令层                                               │
│  ├─ Jupyter 服务器管理                                       │
│  ├─ 文件操作命令                                             │
│  ├─ 环境管理命令                                             │
│  ├─ 内核管理命令                                             │
│  └─ GPU检测命令                                              │
├─────────────────────────────────────────────────────────────┤
│  Rust 后端核心                                               │
│  ├─ Jupyter 服务器管理器                                     │
│  ├─ 内核生命周期管理                                         │
│  ├─ 路径解析器                                               │
│  ├─ 文件操作代理                                             │
│  ├─ 资源限制器                                               │
│  └─ 自动保存引擎                                             │
├─────────────────────────────────────────────────────────────┤
│  外部依赖                                                   │
│  ├─ uv (包管理 + 虚拟环境)                                   │
│  ├─ Jupyter Notebook/Lab                                     │
│  ├─ 显卡驱动 (可选)                                          │
│  └─ SQLite数据库                                             │
└─────────────────────────────────────────────────────────────┘
```

## 桌面端架构

### 核心组件

- **Tauri框架**
  - Rust后端，性能优异
  - 体积小（~5MB），启动快
  - 跨平台支持（Windows/Linux/macOS）

- **前端界面**
  - Jupyter Notebook/Lab 界面（WebView 嵌入）
  - 环境管理界面
  - 内核状态监控

## 技术栈选型

| 模块 | 技术方案 | 优势 | 使用场景 |
|------|----------|------|----------|
| 外壳框架 | Tauri 2.0 | 体积小，Rust性能强 | 应用主框架 |
| 前端界面 | Jupyter Notebook/Lab | 用户熟悉，功能完整 | 代码编写与执行 |
| 内核管理 | Jupyter Kernel | 标准协议，多语言支持 | Python 代码执行 |
| 包管理/环境 | uv | 极速安装，轻量级(~15MB)，支持虚拟环境 | 依赖和环境管理 |
| 数据库 | SQLite | 轻量级，嵌入式 | 本地存储 |
| 路径处理 | dirs crate | 跨平台路径 | 文件系统 |

## 模块设计

### 1. 环境管理模块

**状态**：基础环境 + 多环境管理已实现

```
环境管理器
├─ Base 环境（JupyterLab 运行环境）
│  └─ ~/.pyforge/base/
│  └─ 仅安装 JupyterLab，所有项目共享
├─ 默认环境（业务计算环境）
│  └─ Python 3.12 + numpy + pandas + matplotlib + ipykernel
│  └─ 不包含 JupyterLab
├─ 全局内核存储
│  └─ ~/.pyforge/kernels/pyforge-<env-id>/kernel.json
│  └─ 集中管理所有环境的 kernelspec
└─ 项目内核链接
   └─ ~/.pyforge/projects/kernels/pyforge-<env-id> → 全局内核目录
```

### 2. 项目路径管理模块

**状态**：MVP 已完成

```
项目路径管理器 (MVP 已实现)
├─ 默认项目目录 (~/.pyforge/project/)
├─ 启动时传递给 Jupyter (--notebook-dir)
└─ 跨平台路径处理

项目路径管理器 (Phase 2 - 待实现)
├─ 多项目支持 (~/.pyforge/projects/)
├─ 项目-环境绑定
└─ 项目导入导出 (zip)
```

> **Phase 2 规划**：目录将从 `project/` 迁移到 `projects/`，支持多项目管理

> **注**：文件浏览和编辑由 Jupyter 接管，PyForge 只负责管理项目存放的根目录。

### 3. Jupyter 管理模块

**状态**：Base 环境 JupyterLab 已实现

```
Jupyter 管理器
├─ Base 环境管理
│  ├─ 确保 ~/.pyforge/base 存在
│  ├─ 自动创建并安装 JupyterLab
│  └─ 统一的前端入口
├─ Jupyter Server 管理
│  ├─ 启动/停止服务
│  ├─ 端口管理（自动寻找可用端口）
│  └─ 始终使用 base 环境的 python -m jupyter lab
├─ 内核目录配置
│  ├─ 项目 kernels/ 目录（通过链接暴露内核）
│  └─ 全局 ~/.pyforge/kernels/ 目录
└─ 状态监控
```

### 4. 数据存储模块

```
数据存储
├─ SQLite数据库
│  ├─ 代码历史（时光机功能）
│  ├─ 用户配置
│  └─ 项目元数据
├─ 文件存储
│  ├─ 项目快照备份
│  └─ 导出项目缓存
└─ 缓存管理
   ├─ 包缓存
   └─ 环境缓存
```

## 数据流

### MVP 启动流程（无感启动）

```
用户打开 PyForge
    ↓
检查 base 环境是否存在 (~/.pyforge/base/)
    ├─ 不存在 → 创建 base 环境并安装 JupyterLab
    │          （预计 1-3 分钟，带进度条）
    ↓
检查默认环境是否存在
    ├─ 不存在 → 显示"正在准备环境..."
    │          ├─ uv 创建虚拟环境
    │          ├─ 安装 numpy, pandas, matplotlib, ipykernel
    │          ├─ 注册 kernelspec 到 ~/.pyforge/kernels/
    │          └─ 创建项目内核链接
    │          （预计 1-3 分钟，带进度条）
    ↓
启动 Jupyter Server（使用 base 环境）
    ├─ python -m jupyter lab（来自 base 环境）
    ├─ 查找可用端口
    ├─ 指定 --notebook-dir=~/.pyforge/projects/
    └─ 配置 --KernelSpecManager.kernel_dirs
       （项目 kernels/ + 全局 ~/.pyforge/kernels/）
    ↓
WebView 加载 JupyterLab
    ↓
用户直接写代码运行
```

> **目标**：首次启动 < 3 分钟，后续启动 < 10 秒

### 代码执行流程

```
用户在 Jupyter 中执行 Cell
    ↓
Jupyter Server 接收请求
    ↓
Jupyter Kernel 执行
    ↓
结果返回 Jupyter 前端显示
    ├─ 标准输出
    ├─ 错误信息
    └─ 执行时间
```

> **MVP 说明**：代码执行完全由 Jupyter 负责，防炸盾（资源限制）在后续版本实现。

### 文件操作流程（MVP）

```
用户在 Jupyter 中操作文件
    ↓
Jupyter 文件浏览器
    ├─ 文件增删改
    ├─ 目录遍历
    └─ 文件上传下载
    ↓
直接操作磁盘（在 ~/.pyforge/project/ 内）
```

> **MVP 说明**：固定使用单项目目录 ~/.pyforge/project/，导入导出功能后续实现。

## 安全设计

### MVP 范围

- **路径隔离**：Jupyter 根目录限制在 ~/.pyforge/project/
- **环境隔离**：虚拟环境独立，不影响系统 Python

### 后续版本

- **资源限制**：内存/CPU/执行时间限制（防炸盾）
- **导入导出安全**：zip 文件安全检查

## 性能优化

### MVP 目标

- **首次启动**：< 3 分钟（环境初始化）
- **日常启动**：< 10 秒（直接启动 Jupyter）

### 后续优化

- **环境缓存**：uv 包缓存复用
- **Jupyter 预启动**：后台预启动 Jupyter Server
- **内核保活**：复用 Jupyter Kernel

## 扩展性设计 (待定)

> 以下功能尚未确定，后续根据需求决定是否实现

<!-- 
### 插件系统

- **插件接口**：标准化的插件开发接口
- **插件管理**：插件安装、更新、卸载
- **插件市场**：社区插件分享

### 主题系统

- **主题接口**：可定制的UI主题
- **主题切换**：运行时切换主题
- **主题市场**：社区主题分享
-->

## 下一步

详细的模块实现请参考：
- [文件系统方案](file-system-solution.md)
- [开发路线图](development-roadmap.md)
- [用户体验](user-experience.md)