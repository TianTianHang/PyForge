## Context

PyForge 当前为每个 Python 环境单独安装 JupyterLab，并使用环境内的 jupyter 可执行文件启动 JupyterLab。随着多环境和多项目能力的引入，这种模式导致重复安装、体积膨胀，以及前端升级路径分散。我们希望引入独立的 base 环境集中运行 JupyterLab，将项目使用的 Python 环境仅作为内核提供给前端。

## Goals / Non-Goals

**Goals:**
- 引入 `~/.pyforge/base` 作为唯一的 JupyterLab 运行环境。
- 让默认环境和新建环境不再安装 JupyterLab，仅提供 ipykernel 与基础科学包。
- 将内核规格集中存放于 `~/.pyforge/kernels/`，并通过项目内链接暴露给 Jupyter。
- 调整 Jupyter 启动逻辑，始终使用 base 环境的 JupyterLab，并正确配置 notebook_dir 与 kernel_dirs。
- 为后续项目级内核管理与打包留出清晰扩展点。

**Non-Goals:**
- 迁移和清理历史环境、已有 jupyterlab 安装。
- 项目打包/导出时携带内核规格的方案。
- 更换 JupyterLab 为其他前端形态。

## Decisions

1. **JupyterLab 运行环境：单独的 base 环境**
   - 选择在 `~/.pyforge/base` 下创建一个独立 Python 环境，专门安装 JupyterLab 与其依赖。
   - 理由：
     - 避免在每个业务环境里重复安装 jupyterlab。
     - 前端升级只需更新 base 环境，不影响各业务环境。

2. **业务环境包清单：保留科学包，移除 JupyterLab**
   - 默认环境与新建环境继续预装 `numpy/pandas/matplotlib/ipykernel`，不再包含 `jupyterlab`。
   - 理由：
     - 保持“开箱即用”的科学计算体验。
     - 业务环境专注于计算与依赖管理，不承担前端职责。

3. **内核存储：集中目录 + 项目内链接**
   - 所有环境对应的 kernelspec 统一写入 `~/.pyforge/kernels/pyforge-<env-id>/kernel.json`。
   - 项目目录下创建 `kernels/pyforge-<env-id>` 链接，指向全局 kernels 目录。
   - 理由：
     - 集中存储便于统一管理和调试。
     - 项目内通过链接暴露，便于 Jupyter 按项目查找可用内核。

4. **Jupyter 启动逻辑：始终使用 base 的 JupyterLab**
   - 启动命令固定使用 base 环境的 `python -m jupyter lab`。
   - 启动参数中：
     - `--notebook-dir` 指向当前项目目录。
     - `--KernelSpecManager.kernel_dirs` 包含项目内 `kernels/` 以及全局 `~/.pyforge/kernels`。
   - 理由：
     - 统一前端入口，简化调试。
     - 结合项目内 kernels 链接，即可让项目按需暴露内核。

5. **内核注册方式：手动写 kernel.json**
   - 不再通过 `ipykernel install --user` 写入用户全局 Jupyter 目录。
   - 改为在 Rust 侧直接生成 `kernel.json` 并写入 `~/.pyforge/kernels/`。
   - 理由：
     - 路径更可控，避免依赖系统级 Jupyter 配置。
     - 更符合“PyForge 自己管理 kernelspec 文件”的目标。

## Risks / Trade-offs

- **[Risk] base 环境损坏或缺失** → 需要在启动前提供 `ensure_base_env()` 检查与重新创建逻辑。
- **[Risk] kernelspec 目录与链接不一致** → 删除环境或项目时必须同步清理全局目录与项目内链接。
- **[Trade-off] 固定前端版本依赖 base 环境** → 若用户希望自定义 JupyterLab 版本，需要引入额外配置或覆盖机制。
