use std::path::{Path, PathBuf};
use std::sync::RwLock;

static PYFORGE_ROOT: RwLock<Option<PathBuf>> = RwLock::new(None);

pub fn init_paths(data_dir: PathBuf) -> Result<(), String> {
    std::fs::create_dir_all(&data_dir).map_err(|e| format!("创建数据目录失败: {}", e))?;
    let mut root = PYFORGE_ROOT
        .write()
        .map_err(|e| format!("获取路径锁失败: {}", e))?;
    *root = Some(data_dir);
    Ok(())
}

pub fn get_pyforge_root() -> PathBuf {
    PYFORGE_ROOT
        .read()
        .ok()
        .and_then(|r| r.clone())
        .unwrap_or_else(|| {
            dirs::home_dir()
                .expect("无法获取用户主目录")
                .join(".pyforge")
        })
}

pub fn get_envs_dir() -> PathBuf {
    get_pyforge_root().join("envs")
}

pub fn get_env_dir(env_id: &str) -> PathBuf {
    get_envs_dir().join(env_id)
}

pub fn get_projects_dir() -> PathBuf {
    get_pyforge_root().join("projects")
}

pub fn get_project_dir() -> PathBuf {
    get_projects_dir()
}

pub fn get_project_dir_by_id(project_id: &str) -> PathBuf {
    get_projects_dir().join(project_id)
}

pub fn get_env_metadata_path() -> PathBuf {
    get_pyforge_root().join(".envs-metadata.json")
}

pub fn get_projects_metadata_path() -> PathBuf {
    get_pyforge_root().join(".projects-metadata.json")
}

pub fn ensure_dir(path: &Path) -> Result<(), String> {
    std::fs::create_dir_all(path).map_err(|e| format!("创建目录失败: {}", e))
}

pub fn get_python_path(env_id: &str) -> PathBuf {
    let env_dir = get_env_dir(env_id);
    if cfg!(target_os = "windows") {
        env_dir.join("Scripts").join("python.exe")
    } else {
        env_dir.join("bin").join("python")
    }
}

pub fn get_jupyter_path(env_id: &str) -> PathBuf {
    let env_dir = get_env_dir(env_id);
    if cfg!(target_os = "windows") {
        env_dir.join("Scripts").join("jupyter.exe")
    } else {
        env_dir.join("bin").join("jupyter")
    }
}

pub fn get_base_env_dir() -> PathBuf {
    get_pyforge_root().join("base")
}

pub fn get_kernel_store_dir() -> PathBuf {
    get_pyforge_root().join("kernels")
}

pub fn get_base_python_path() -> PathBuf {
    let base_dir = get_base_env_dir();
    if cfg!(target_os = "windows") {
        base_dir.join("Scripts").join("python.exe")
    } else {
        base_dir.join("bin").join("python")
    }
}

pub fn get_project_kernel_dir(project_id: &str) -> PathBuf {
    get_project_dir_by_id(project_id).join("kernels")
}
