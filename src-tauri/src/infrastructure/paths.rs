use std::path::PathBuf;

pub fn get_pyforge_root() -> PathBuf {
    dirs::home_dir()
        .expect("无法获取用户主目录")
        .join(".pyforge")
}

pub fn get_env_dir() -> PathBuf {
    get_pyforge_root().join("env")
}

pub fn get_project_dir() -> PathBuf {
    get_pyforge_root().join("project")
}

pub fn ensure_dir(path: &PathBuf) -> Result<(), String> {
    std::fs::create_dir_all(path).map_err(|e| format!("创建目录失败: {}", e))
}

pub fn get_python_path() -> PathBuf {
    let env_dir = get_env_dir();
    if cfg!(target_os = "windows") {
        env_dir.join("Scripts").join("python.exe")
    } else {
        env_dir.join("bin").join("python")
    }
}

pub fn get_jupyter_path() -> PathBuf {
    let env_dir = get_env_dir();
    if cfg!(target_os = "windows") {
        env_dir.join("Scripts").join("jupyter.exe")
    } else {
        env_dir.join("bin").join("jupyter")
    }
}
