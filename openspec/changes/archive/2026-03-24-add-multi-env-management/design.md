# 多环境管理设计文档

## 架构概述

```
┌─────────────────────────────────────────────────────────────────┐
│                      前端界面 (React)                            │
├─────────────────────────────────────────────────────────────────┤
│  App.tsx                                                        │
│  ├─ EnvironmentPanel (新增)                                     │
│  │  ├─ EnvironmentList                                          │
│  │  ├─ CreateEnvironmentDialog                                  │
│  │  └─ EnvironmentDetail                                        │
│  │     └─ PackageList                                           │
│  └─ JupyterViewer (修改)                                        │
│     └─ 内核选择器（由 JupyterLab 提供）                          │
├─────────────────────────────────────────────────────────────────┤
│  Hooks                                                          │
│  ├─ useEnvironment (修改)                                       │
│  └─ usePackageManager (新增)                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Tauri 命令层 (api/)                           │
├─────────────────────────────────────────────────────────────────┤
│  env_commands.rs (扩展)                                         │
│  ├─ list_environments                                           │
│  ├─ create_environment                                          │
│  ├─ delete_environment                                          │
│  ├─ list_packages                                               │
│  ├─ install_package                                             │
│  └─ uninstall_package                                           │
├─────────────────────────────────────────────────────────────────┤
│  jupyter_commands.rs (修改)                                     │
│  └─ start_jupyter 增加 env_id 参数                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    领域层 (domain/)                              │
├─────────────────────────────────────────────────────────────────┤
│  environment/                                                   │
│  ├─ mod.rs                                                      │
│  ├─ creator.rs (修改)                                           │
│  ├─ deleter.rs (新增)                                           │
│  ├─ lister.rs (新增)                                            │
│  ├─ kernel.rs (扩展)                                            │
│  └─ package_manager.rs (新增)                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    基础设施层 (infrastructure/)                   │
├─────────────────────────────────────────────────────────────────┤
│  paths.rs (扩展)                                                │
│  ├─ get_envs_dir()                                              │
│  ├─ get_env_dir(env_id)                                         │
│  ├─ get_projects_dir()                                          │
│  └─ get_env_metadata_path()                                     │
├─────────────────────────────────────────────────────────────────┤
│  metadata.rs (新增)                                             │
│  ├─ EnvsMetadata                                                │
│  ├─ load_envs_metadata()                                        │
│  └─ save_envs_metadata()                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    数据模型 (models/)                            │
├─────────────────────────────────────────────────────────────────┤
│  env.rs (扩展)                                                  │
│  ├─ Environment                                                 │
│  ├─ InstalledPackage                                            │
│  └─ EnvsMetadata                                                │
└─────────────────────────────────────────────────────────────────┘
```

## 数据模型

### Rust 模型

```rust
// models/env.rs

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Environment {
    pub id: String,              // 唯一标识，如 "default", "data-analysis"
    pub name: String,            // 显示名称，如 "默认环境", "数据分析"
    pub python_version: String,  // Python 版本，如 "3.10"
    pub path: String,            // 环境目录绝对路径
    pub kernel_name: String,     // Jupyter 内核名称，如 "pyforge-default"
    pub created_at: String,      // ISO 8601 时间戳
    pub is_default: bool,        // 是否为默认环境
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstalledPackage {
    pub name: String,            // 包名
    pub version: String,         // 版本号
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvsMetadata {
    pub version: u32,            // 元数据版本，用于迁移
    pub environments: HashMap<String, Environment>,  // id -> Environment
}
```

### TypeScript 模型

```typescript
// types/index.ts

export interface Environment {
  id: string;
  name: string;
  python_version: string;
  path: string;
  kernel_name: string;
  created_at: string;
  is_default: boolean;
}

export interface InstalledPackage {
  name: string;
  version: string;
}

export type AppState =
  | "checking"
  | "no_env"
  | "creating_env"
  | "starting_jupyter"
  | "ready"
  | "error";
```

## Tauri 命令接口

### 环境管理命令

```rust
/// 获取所有环境列表
#[tauri::command]
async fn list_environments() -> Result<Vec<Environment>, String> {
    // 1. 加载 .envs-metadata.json
    // 2. 扫描 ~/.pyforge/envs/ 目录，验证每个环境存在
    // 3. 返回环境列表
}

/// 创建新环境
#[tauri::command]
async fn create_environment(
    app: tauri::AppHandle,
    name: String,              // 环境名称（用于 ID 生成和显示）
    python_version: String,    // Python 版本，如 "3.10"
    packages: Vec<String>,     // 预装包列表，如 ["numpy", "pandas"]
) -> Result<Environment, String> {
    // 1. 生成环境 ID（name 转小写、替换空格为连字符）
    // 2. 检查 ID 是否已存在
    // 3. 调用 uv venv 创建虚拟环境
    // 4. 调用 uv pip install 安装包
    // 5. 注册 Jupyter 内核
    // 6. 更新元数据
    // 7. 返回 Environment
}

/// 删除环境
#[tauri::command]
async fn delete_environment(env_id: String) -> Result<(), String> {
    // 1. 检查是否为默认环境（不可删除）
    // 2. 注销 Jupyter 内核
    // 3. 删除环境目录
    // 4. 更新元数据
}
```

### 包管理命令

```rust
/// 获取环境的包列表
#[tauri::command]
async fn list_packages(env_id: String) -> Result<Vec<InstalledPackage>, String> {
    // 1. 获取环境路径
    // 2. 调用 uv pip list --python <path>
    // 3. 解析输出，返回包列表
}

/// 安装包
#[tauri::command]
async fn install_package(
    app: tauri::AppHandle,
    env_id: String,
    package_name: String,
) -> Result<(), String> {
    // 1. 获取环境路径
    // 2. 调用 uv pip install --python <path> <package>
    // 3. 发送进度事件
}

/// 卸载包
#[tauri::command]
async fn uninstall_package(
    env_id: String,
    package_name: String,
) -> Result<(), String> {
    // 1. 获取环境路径
    // 2. 调用 uv pip uninstall --python <path> <package>
}
```

## 文件系统

### 目录结构

```
~/.pyforge/
├── envs/                          # 环境根目录
│   ├── default/                   # 默认环境
│   │   ├── bin/python             # Python 解释器
│   │   ├── lib/python3.10/        # 包安装位置
│   │   └── pyvenv.cfg             # 虚拟环境配置
│   ├── data-analysis/             # 用户创建的环境
│   │   ├── bin/python
│   │   └── lib/python3.11/
│   └── ml/                        # 另一个环境
│       └── ...
├── projects/                      # 项目根目录
│   ├── .metadata/                 # 项目元数据
│   │   ├── project-1.json
│   │   └── project-2.json
│   ├── project-1/                 # 项目目录
│   │   └── *.ipynb
│   └── project-2/
│       └── ...
└── .envs-metadata.json            # 环境元数据索引
```

### 元数据文件格式

```json
// .envs-metadata.json
{
  "version": 1,
  "environments": {
    "default": {
      "id": "default",
      "name": "默认环境",
      "python_version": "3.10",
      "path": "/home/user/.pyforge/envs/default",
      "kernel_name": "pyforge-default",
      "created_at": "2026-03-24T10:00:00Z",
      "is_default": true
    },
    "data-analysis": {
      "id": "data-analysis",
      "name": "数据分析",
      "python_version": "3.11",
      "path": "/home/user/.pyforge/envs/data-analysis",
      "kernel_name": "pyforge-data-analysis",
      "created_at": "2026-03-24T11:00:00Z",
      "is_default": false
    }
  }
}
```

## Jupyter 内核管理

### 内核注册

每个环境注册为独立的 Jupyter 内核：

```rust
async fn register_kernel(env_id: &str, env: &Environment) -> Result<(), String> {
    let python_path = get_python_path(env_id);
    
    Command::new(&python_path)
        .args([
            "-m", "ipykernel", "install", "--user",
            "--name", &env.kernel_name,
            "--display-name", &format!("PyForge - {}", env.name),
        ])
        .output()
        .await?;
    
    Ok(())
}
```

### 内核命名规范

- 格式：`pyforge-{env-id}`
- 示例：`pyforge-default`, `pyforge-data-analysis`
- 显示名称：`PyForge - {env-name}`

## 前端组件

### EnvironmentPanel

```tsx
// components/EnvironmentPanel.tsx

interface EnvironmentPanelProps {
  environments: Environment[];
  currentEnvId: string | null;
  onSelectEnv: (envId: string) => void;
  onCreateEnv: (name: string, pythonVersion: string, packages: string[]) => Promise<void>;
  onDeleteEnv: (envId: string) => Promise<void>;
}

export function EnvironmentPanel({ ... }: EnvironmentPanelProps) {
  return (
    <div className="environment-panel">
      <h3>环境管理</h3>
      <EnvironmentList
        environments={environments}
        currentEnvId={currentEnvId}
        onSelect={onSelectEnv}
        onDelete={onDeleteEnv}
      />
      <CreateEnvironmentDialog onCreate={onCreateEnv} />
    </div>
  );
}
```

### usePackageManager Hook

```typescript
// hooks/usePackageManager.ts

export function usePackageManager(envId: string) {
  const [packages, setPackages] = useState<InstalledPackage[]>([]);
  const [loading, setLoading] = useState(false);

  const listPackages = useCallback(async () => {
    const result = await invoke<InstalledPackage[]>("list_packages", { envId });
    setPackages(result);
  }, [envId]);

  const installPackage = useCallback(async (packageName: string) => {
    setLoading(true);
    try {
      await invoke("install_package", { envId, packageName });
      await listPackages();
    } finally {
      setLoading(false);
    }
  }, [envId, listPackages]);

  const uninstallPackage = useCallback(async (packageName: string) => {
    setLoading(true);
    try {
      await invoke("uninstall_package", { envId, packageName });
      await listPackages();
    } finally {
      setLoading(false);
    }
  }, [envId, listPackages]);

  return { packages, loading, listPackages, installPackage, uninstallPackage };
}
```

## 迁移逻辑

### 从 MVP 迁移到多环境

```rust
// infrastructure/migration.rs

pub fn migrate_from_mvp() -> Result<(), String> {
    let old_env_dir = get_pyforge_root().join("env");
    let new_envs_dir = get_pyforge_root().join("envs");
    let default_env_dir = new_envs_dir.join("default");
    
    // 如果旧目录存在且新目录不存在，执行迁移
    if old_env_dir.exists() && !new_envs_dir.exists() {
        // 1. 创建新目录结构
        std::fs::create_dir_all(&new_envs_dir)?;
        
        // 2. 移动旧环境到 default
        std::fs::rename(&old_env_dir, &default_env_dir)?;
        
        // 3. 创建元数据
        let metadata = EnvsMetadata {
            version: 1,
            environments: HashMap::from([(
                "default".to_string(),
                Environment {
                    id: "default".to_string(),
                    name: "默认环境".to_string(),
                    python_version: "3.10".to_string(),
                    path: default_env_dir.to_string_lossy().to_string(),
                    kernel_name: "pyforge-default".to_string(),
                    created_at: chrono::Utc::now().to_rfc3339(),
                    is_default: true,
                },
            )]),
        };
        save_envs_metadata(&metadata)?;
    }
    
    Ok(())
}
```

## 安全考虑

1. **环境 ID 验证**：只允许字母、数字、连字符，防止路径遍历
2. **包名验证**：验证包名格式，防止命令注入
3. **默认环境保护**：删除操作前检查 `is_default` 标志
4. **并发保护**：使用 Mutex 保护元数据读写
