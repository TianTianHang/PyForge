## Context

PyForge 现在只有一个共享的 notebook 目录 `~/.pyforge/projects/`，每次启动 Jupyter 都指向同一个位置。多环境管理（`add-multi-env-management`）已经完成，每个环境有独立的 Python venv 和 Jupyter kernel。下一步是引入项目概念，让每个项目有独立的 notebook 目录并绑定到一个环境。

核心约束：
- 单实例 Jupyter：切换项目时停止旧进程，启动新进程（不做多实例并存）
- 一对一绑定：一个项目绑定一个环境，一个环境可被多个项目共享
- 元数据格式：单一 `.projects-metadata.json` 文件，与 `.envs-metadata.json` 对称
- 向后兼容：已有用户自动迁移，不需要手动操作

## Goals / Non-Goals

**Goals:**
- 每个项目有独立的 notebook 目录
- 项目和环境一对一绑定，启动 Jupyter 时自动使用绑定环境的内核
- 用户可以在项目间切换（停止旧 Jupyter → 启动新 Jupyter）
- 已有用户无感迁移

**Non-Goals:**
- 多 Jupyter 实例并存（每个项目一个独立端口）
- 项目导入导出（zip 打包/解包）
- 项目重命名
- 项目排序和搜索

## Decisions

### 1. 元数据存储：单一文件 vs 每项目一个文件

**选择：单一文件 `.projects-metadata.json`**

理由：
- 与环境元数据（`.envs-metadata.json`）保持一致的模式
- 简化 I/O：一次读写即可获取所有项目信息
- 项目数量通常不多（几个到几十个），单文件性能足够
- 每项目一个文件需要维护 `.metadata/` 目录结构，增加复杂度

替代方案：每项目一个 JSON 文件（`~/.pyforge/.metadata/{project_id}.json`）——设计文档最初建议此方案，但考虑到与环境元数据的一致性，选择单一文件。

### 2. 项目 ID 生成：名称推导 vs UUID

**选择：名称推导 `proj-{name}`**

理由：
- 与环境 ID 生成方式一致（`name.to_lowercase().replace(" ", "-")`）
- 目录名可读，方便调试和手动管理
- 简单场景下 UUID 过度设计

替代方案：UUID（如 `proj-a1b2c3d4`）——更安全但不可读，在桌面应用中不需要。

风险：特殊字符和路径遍历需要验证。处理方式：限制 `proj-` 前缀 + 清理特殊字符 + 禁止 `..`。

### 3. 启动流程：项目优先 vs 环境优先

**选择：项目优先**

理由：
- 用户的日常工作单位是项目，不是环境
- 项目包含环境信息（通过绑定），选了项目就隐含选了环境
- 流程更直观：选项目 → 进 Jupyter

当前流程：检查环境 → 选环境 → 进 Jupyter
目标流程：检查环境 → 加载项目 → 选项目 → 进 Jupyter

### 4. Jupyter 进程管理：单实例切换

**选择：切换项目时停止旧 Jupyter，启动新 Jupyter**

理由：
- 每个项目绑定不同目录，多实例会占用多个端口和进程
- UI 复杂度低：一个 WebView 始终显示当前项目的 Jupyter
- 切换延迟可接受（Jupyter 启动约 2-3 秒）

### 5. 迁移策略

**选择：自动创建「我的项目」**

理由：
- 已有用户的 notebook 都在 `~/.pyforge/projects/`，目录不变
- 只需新增元数据文件，不移动文件
- 默认绑定 `default` 环境，与当前行为一致

## Risks / Trade-offs

**[Risk] 项目 ID 冲突** → 用户创建同名项目时，追加数字后缀（如 `proj-分析-2`）

**[Risk] 绑定环境被删除** → 删除环境时检查是否有项目绑定，提示用户先解除绑定或重新关联

**[Risk] 项目目录被外部删除** → `list_projects` 过滤不存在的目录，不报错但不显示

**[Risk] 切换项目时 Jupyter 停止失败** → 超时后强制 kill 进程，确保新项目能启动

**[Trade-off] 单实例切换有延迟** → 用户切换项目需等待 2-3 秒启动 Jupyter，可接受（比多实例的资源占用和 UI 复杂度更优）

## Migration Plan

1. 检测 `.projects-metadata.json` 是否存在
2. 如果不存在，检查 `~/.pyforge/projects/` 是否有内容
3. 如果有内容，创建默认项目元数据（name: "我的项目", env_id: "default"）
4. 保存到 `.projects-metadata.json`
5. 如果没有内容（全新安装），跳过迁移，用户需手动创建第一个项目

## Open Questions

- 项目名称是否需要唯一约束？（建议是，避免 ID 冲突）
- 删除环境时是否应该阻止？（如果有项目绑定，应该提示而不是静默处理）
