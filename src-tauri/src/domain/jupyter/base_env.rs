use std::path::PathBuf;
use std::sync::OnceLock;
use tauri::Emitter;
use tokio::process::Command;
use tokio::sync::Mutex;

use crate::infrastructure::{
    ensure_dir, get_base_env_dir, get_base_python_path, PYPI_MIRROR_URL,
};

static BASE_ENV_MUTEX: OnceLock<Mutex<bool>> = OnceLock::new();

fn get_base_env_mutex() -> &'static Mutex<bool> {
    BASE_ENV_MUTEX.get_or_init(|| Mutex::new(false))
}

fn check_base_env_exists() -> bool {
    let base_dir = get_base_env_dir();
    let python_path = get_base_python_path();
    base_dir.exists() && python_path.exists()
}

async fn create_base_env(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let base_dir = get_base_env_dir();
    let python_path = get_base_python_path();

    let _ = app.emit("env-progress", "正在创建基础环境...");
    ensure_dir(&base_dir)?;

    let output = Command::new("uv")
        .args([
            "venv",
            base_dir.to_str().unwrap(),
            "--python",
            "3.12",
        ])
        .output()
        .await
        .map_err(|e| format!("Failed to create base venv: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Failed to create base venv: {}", stderr));
    }

    let _ = app.emit("env-progress", "正在安装 JupyterLab...");
    let output = Command::new("uv")
        .args([
            "pip", "install", "--python",
            python_path.to_str().unwrap(),
            "--index-url", PYPI_MIRROR_URL,
            "jupyterlab",
        ])
        .output()
        .await
        .map_err(|e| format!("Failed to install JupyterLab: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Failed to install JupyterLab: {}", stderr));
    }

    Ok(python_path)
}

pub async fn ensure_base_env(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    if check_base_env_exists() {
        return Ok(get_base_python_path());
    }

    let _guard = get_base_env_mutex().lock().await;

    if check_base_env_exists() {
        return Ok(get_base_python_path());
    }

    create_base_env(app).await
}

pub fn get_base_python() -> Result<PathBuf, String> {
    if !check_base_env_exists() {
        return Err("Base environment does not exist".to_string());
    }
    Ok(get_base_python_path())
}