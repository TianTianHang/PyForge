# 项目路径管理方案

## 概述

本方案定义 PyForge 的项目目录结构和管理方式。由于使用 Jupyter 作为前端，文件浏览和编辑由 Jupyter 接管，PyForge 只负责管理项目存放的根目录和项目导入导出功能。

## 设计目标

1. **简化设计**：利用 Jupyter 的文件管理能力，减少重复开发
2. **跨平台兼容**：自动处理 Windows/Linux/macOS 路径差异
3. **环境隔离**：不同虚拟环境使用独立的工作目录
4. **易于迁移**：项目导入导出简单便捷

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      PyForge 桌面应用                        │
├─────────────────────────────────────────────────────────────┤
│  前端界面 (WebView)                                          │
│  ├─ JupyterLab 文件浏览器（由 Jupyter 提供）                 │
│  ├─ Jupyter 代码编辑器（由 Jupyter 提供）                    │
│  └─ PyForge 环境管理面板                                     │
├─────────────────────────────────────────────────────────────┤
│  Tauri 命令层                                               │
│  ├─ start_jupyter(project_path)                             │
│  ├─ stop_jupyter()                                          │
│  ├─ import_project(zip_path)                                │
│  └─ export_project(project_path, output_path)               │
├─────────────────────────────────────────────────────────────┤
│  Rust 后端核心                                               │
│  ├─ 项目路径管理器                                           │
│  │  ├─ 获取项目根目录                                        │
│  │  ├─ 创建项目目录                                          │
│  │  └─ 跨平台路径处理                                        │
│  ├─ Jupyter 服务器管理器                                     │
│  │  ├─ 启动参数构建（--notebook-dir）                        │
│  │  └─ 端口/token 管理                                       │
│  └─ 项目导入导出                                             │
│     ├─ 项目打包（zip）                                       │
│     └─ 项目解包                                              │
├─────────────────────────────────────────────────────────────┤
│  真实文件系统                                                 │
│  ├─ Windows: C:\Users\{User}\AppData\Local\PyForge\projects\ │
│  ├─ macOS:   /Users/{user}/Library/Application Support/PyForge/projects/
│  └─ Linux:   /home/{user}/.local/share/PyForge/projects/    │
└─────────────────────────────────────────────────────────────┘
```

### 职责划分

| 功能 | Jupyter 负责 | PyForge 负责 |
|------|-------------|--------------|
| 文件浏览 | ✅ 文件树展示 | ❌ |
| 文件编辑 | ✅ 代码编辑 | ❌ |
| 文件增删改 | ✅ 新建/删除/重命名 | ❌ |
| 文件上传下载 | ✅ 上传/下载按钮 | ❌ |
| 工作目录指定 | ❌ | ✅ 启动时传入 `--notebook-dir` |
| 项目目录创建 | ❌ | ✅ 新建项目时创建目录 |
| 项目导入导出 | ❌ | ✅ 打包/解包 zip |
| 环境绑定 | ❌ | ✅ 为项目指定 Python 内核 |

## 核心设计

### 1. 项目目录结构

#### 根目录规范

使用 `dirs` crate 获取系统标准数据目录：

```rust
use dirs::data_dir;

fn get_projects_root() -> PathBuf {
    data_dir()
        .expect("无法获取数据目录")
        .join("PyForge")
        .join("projects")
}
```

#### 跨平台路径

| 平台 | 项目根目录路径 |
|------|---------------|
| Windows | `%LOCALAPPDATA%\PyForge\projects\` |
| macOS | `~/Library/Application Support/PyForge/projects/` |
| Linux | `~/.local/share/PyForge/projects/` |

#### 项目目录组织

```
projects/
├── project-1/                    # 项目1目录
│   ├── notebook.ipynb           # Jupyter 笔记本
│   ├── data.csv                 # 数据文件
│   └── utils.py                 # 辅助代码
├── project-2/                    # 项目2目录
│   └── ...
└── .metadata/                    # PyForge 元数据（隐藏）
    ├── project-1.json           # 项目1配置（关联的环境ID等）
    └── project-2.json
```

### 2. Jupyter 启动流程

```
用户选择项目 / 创建新项目
    ↓
PyForge 准备项目目录
    ├─ 检查目录是否存在
    ├─ 创建必要的子目录（如 .ipynb_checkpoints）
    └─ 读取项目配置（关联的虚拟环境）
    ↓
启动 Jupyter Server
    ├─ 查找可用端口
    ├─ 生成访问 token
    ├─ 构建启动参数：
    │   jupyter lab
    │     --notebook-dir=/path/to/project
    │     --port=xxxx
    │     --token=xxxx
    │     --no-browser
    └─ 启动子进程
    ↓
WebView 加载 Jupyter
    └─ http://localhost:xxxx/lab?token=xxxx
```

### 3. 项目导入导出

#### 导入项目

```
用户选择 .zip 文件
    ↓
安全检查
    ├─ 检查文件大小（限制 100MB）
    ├─ 检查文件名合法性
    └─ 扫描 zip 内容（防止 zip bomb）
    ↓
解压到临时目录
    ↓
验证项目结构
    ├─ 检查是否包含合法文件
    └─ 检查路径遍历攻击（..）
    ↓
移动到项目目录
    └─ 生成唯一项目名（避免冲突）
    ↓
创建元数据文件
    └─ 关联到默认虚拟环境
```

#### 导出项目

```
用户点击导出按钮
    ↓
打包项目目录
    ├─ 排除：.ipynb_checkpoints/
    ├─ 排除：__pycache__/
    ├─ 排除：.git/
    └─ 排除：大型数据文件（>10MB 提示）
    ↓
生成 .zip 文件
    └─ 文件名：{project-name}-{timestamp}.zip
    ↓
保存到用户指定位置
    ↓
显示导出结果
```

### 4. 环境绑定机制

每个项目关联一个虚拟环境（Python 内核）：

```json
// .metadata/project-xxx.json
{
  "project_id": "project-xxx",
  "project_name": "数据分析项目",
  "created_at": "2024-01-15T10:30:00Z",
  "environment": {
    "env_id": "env-base-3.10",
    "env_name": "基础环境",
    "python_version": "3.10",
    "kernel_name": "pyforge-env-base-3.10"
  },
  "jupyter_settings": {
    "auto_save": true,
    "autosave_interval": 120
  }
}
```

启动 Jupyter 时，根据配置启动对应的 kernel。

## Tauri 命令接口

### 项目路径管理命令

```rust
/// 获取项目根目录路径
#[tauri::command]
fn get_projects_root() -> Result<String, String>;

/// 创建新项目目录
#[tauri::command]
fn create_project(name: String) -> Result<ProjectInfo, String>;

/// 列出所有项目
#[tauri::command]
fn list_projects() -> Result<Vec<ProjectInfo>, String>;

/// 重命名项目
#[tauri::command]
fn rename_project(project_id: String, new_name: String) -> Result<(), String>;

/// 删除项目
#[tauri::command]
fn delete_project(project_id: String) -> Result<(), String>;
```

### Jupyter 管理命令

```rust
/// 启动 Jupyter Server
#[tauri::command]
async fn start_jupyter(project_id: String) -> Result<JupyterInfo, String>;

/// 停止 Jupyter Server
#[tauri::command]
async fn stop_jupyter() -> Result<(), String>;

/// 获取 Jupyter 状态
#[tauri::command]
fn get_jupyter_status() -> JupyterStatus;
```

### 项目导入导出命令

```rust
/// 导入项目
#[tauri::command]
async fn import_project(zip_path: String) -> Result<ProjectInfo, String>;

/// 导出项目
#[tauri::command]
async fn export_project(project_id: String, output_path: String) -> Result<(), String>;
```

## 安全设计

### 路径安全

1. **路径遍历防护**
   - 严格验证所有用户输入路径
   - 禁止 `..` 组件
   - 使用 `Path::canonicalize()` 后验证前缀

2. **项目隔离**
   - 每个项目独立目录
   - Jupyter 根目录限制在项目内（`--notebook-dir`）

3. **导入安全检查**
   - Zip 文件大小限制
   - 解压路径验证
   - 禁止符号链接

### Jupyter 安全

1. **Token 验证**
   - 自动生成随机 token
   - WebView 启动时传入 token

2. **端口安全**
   - 使用本地回环地址（127.0.0.1）
   - 动态端口分配（避免冲突）

3. **内核资源限制**
   - 内存限制（1GB）
   - 执行时间限制（30秒）
   - 通过 Jupyter Kernel 配置实现

## 性能优化

### 启动优化

- **Jupyter 预启动**：后台预启动常用环境的 Jupyter Server
- **端口缓存**：记录上次使用的端口，优先尝试复用

### 运行时优化

- **项目切换保持**：切换项目时不关闭整个应用，只重启 Jupyter
- **增量导出**：大项目导出时显示进度条

## 与旧方案的对比

| 特性 | 旧方案（虚拟文件系统） | 新方案（Jupyter 集成） |
|------|---------------------|---------------------|
| 文件浏览 | 自行实现文件树 | Jupyter 内置 |
| 文件编辑 | Monaco Editor | Jupyter 编辑器 |
| 路径抽象 | 虚拟路径 `/app/` | 真实路径直接暴露 |
| Python I/O | 需要劫持 open() | 原生支持 |
| 复杂度 | 高 | 低 |
| 功能完整性 | 需自行实现 | Jupyter 生态完整 |
| 开发工作量 | 大 | 小 |

## 参考

- [JupyterLab Documentation](https://jupyterlab.readthedocs.io/)
- [Jupyter Kernel Gateway](https://jupyter-kernel-gateway.readthedocs.io/)
- [dirs crate - Rust](https://docs.rs/dirs/latest/dirs/)
