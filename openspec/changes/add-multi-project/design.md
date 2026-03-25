## Context

PyForge 现在只有一个共享的 notebook 目录 `~/.pyforge/projects/`，每次启动 Jupyter 都指向同一个位置。多环境管理（`add-multi-env-management`）已经完成，每个环境有独立的 Python venv 和 Jupyter kernel。下一步是引入项目概念，让每个项目有独立的 notebook 目录，并通过项目级的内核绑定实现内核可见性隔离——用户在一个项目中只能看到该项目绑定的内核，避免用错内核。

核心约束：
- 单实例 Jupyter：切换项目时停止旧进程，启动新进程（不做多实例并存）
- 内核作用域隔离：`--KernelSpecManager.kernel_dirs` 仅包含项目 `kernels/` 目录，全局 `~/.pyforge/kernels/` 仅作存储不给 Jupyter 搜索
- 内核绑定机制：通过 symlink 实现，创建环境时自动绑定到当前项目，其他项目需手动绑定
- 元数据格式：单一 `.projects-metadata.json` 文件，与 `.envs-metadata.json` 对称
- 向后兼容：已有用户自动迁移，不需要手动操作

## Goals / Non-Goals

**Goals:**
- 每个项目有独立的 notebook 目录
- 每个项目只能看到自己绑定的内核，实现内核可见性隔离
- 创建环境时自动绑定到当前项目，其他项目可通过手动绑定共享
- 用户可以在项目间切换（停止旧 Jupyter → 启动新 Jupyter）
- Jupyter 运行中可动态添加/移除内核，无需重启
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

### 6. 内核作用域：项目级别的内核可见性

**选择：每个项目只看到自己绑定的内核，全局 kernels/ 目录仅作存储**

理由：
- 用户的核心诉求是"不要用错内核"，隔离比便利更重要
- `--KernelSpecManager.kernel_dirs` 只包含 `projects/{project_id}/kernels/`
- 全局 `~/.pyforge/kernels/` 存放 kernel spec 文件，但不直接给 Jupyter 搜索
- 项目 `kernels/` 下通过 symlink 指向全局 spec，实现按需暴露

实现方式：
```
start_jupyter(project_id):
  kernel_dirs = [ projects/{project_id}/kernels/ ]
  // 不再包含全局 kernels/
```

### 7. 内核绑定策略：创建时自动绑定 + 后续手动追加

**选择：创建环境时自动绑定到当前项目；其他项目通过「添加已有内核」手动绑定**

理由：
- 符合用户直觉：在项目里创建的环境，自然应该在该项目里可用
- 保持灵活性：已创建的环境可以被其他项目通过手动绑定来使用
- 一对一绑定不是硬约束：一个环境的 kernel 可以被多个项目绑定

流程：
```
create_environment(env_id, 当前项目=X):
  ├── 创建 venv + 注册全局 kernel spec
  └── 自动在 projects/X/kernels/ 下创建 symlink

用户在项目 Y 的设置里"添加已有内核":
  └── 在 projects/Y/kernels/ 下创建 symlink → 同一个全局 spec
```

### 8. 孤立内核处理

**选择：未绑定到任何项目的内核在 Jupyter 中不可见，这是期望行为**

场景：
- 删除项目后，该环境未绑定到其他项目 → 变成孤立内核
- 孤立内核在 EnvironmentPanel 中仍可见，但在 Jupyter 中不可用
- 用户需要在某个项目的设置中手动绑定才能再次使用

### 9. 运行时内核管理

**选择：Jupyter 运行中可以添加/移除内核，无需重启**

- 从 JupyterViewer 工具栏可打开项目设置
- 添加内核 = 创建 symlink → Jupyter 自动发现新 kernel（或通过 API 刷新）
- 移除内核 = 删除 symlink → Jupyter 内核列表更新

### 10. 删除环境的安全检查

**选择：删除环境时，如果仍有项目绑定该环境，阻止删除并提示用户先解绑**

理由：
- 防止项目引用无效内核
- 用户明确要求解绑后再删除，确保操作意图清晰
- 如果 Jupyter 正在运行且使用该环境的内核，同样阻止删除

## Risks / Trade-offs

**[Risk] 项目 ID 冲突** → 用户创建同名项目时，追加数字后缀（如 `proj-分析-2`）

**[Risk] 绑定环境被删除** → 删除环境时检查是否有项目绑定（Decision 10），如果有则拦截并提示解绑

**[Risk] 项目目录被外部删除** → `list_projects` 过滤不存在的目录，不报错但不显示

**[Risk] 切换项目时 Jupyter 停止失败** → 超时后强制 kill 进程，确保新项目能启动

**[Risk] 孤立内核** → 环境被创建但未绑定到任何项目时完全不可用。设计上这是期望行为，但需确保 UI 能引导用户完成绑定

**[Risk] Jupyter kernel 动态发现** → 添加 symlink 后 Jupyter 可能需要调用 API 刷新内核列表。需测试两种方式（自动发现 vs 手动刷新），选择可靠方案

**[Trade-off] 单实例切换有延迟** → 用户切换项目需等待 2-3 秒启动 Jupyter，可接受（比多实例的资源占用和 UI 复杂度更优）

**[Trade-off] 内核隔离 vs 便利性** → 选择强隔离（项目只能看到绑定的内核），牺牲了"一次性访问所有内核"的便利。对初学者来说，清晰比便利更重要

## Migration Plan

1. 检测 `.projects-metadata.json` 是否存在
2. 如果不存在，检查 `~/.pyforge/projects/` 是否有内容
3. 如果有内容，创建默认项目元数据（name: "我的项目", env_id: "default"）
4. 保存到 `.projects-metadata.json`
5. 如果没有内容（全新安装），跳过迁移，用户需手动创建第一个项目

## Open Questions

- 项目名称是否需要唯一约束？（建议是，避免 ID 冲突）
- ~~删除环境时是否应该阻止？~~ **已决定：如果仍有项目绑定则阻止删除，要求先解绑**
- Jupyter kernel 动态发现机制：自动发现 vs API 刷新，需实测确定
- ProjectSettings 采用 modal 还是独立页面？（建议 modal，与 CreateProjectDialog 一致）
