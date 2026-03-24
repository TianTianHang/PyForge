use std::path::{Path, PathBuf};

pub fn get_pyforge_root() -> PathBuf {
    dirs::home_dir()
        .expect("无法获取用户主目录")
        .join(".pyforge")
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

pub fn get_env_metadata_path() -> PathBuf {
    get_pyforge_root().join(".envs-metadata.json")
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
