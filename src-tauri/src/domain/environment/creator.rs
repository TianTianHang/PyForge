use tauri::Emitter;
use tokio::process::Command;
use crate::infrastructure::{get_env_dir, get_project_dir, get_pyforge_root, ensure_dir, get_python_path, PYPI_MIRROR_URL};

#[derive(Debug, Clone, serde::Serialize)]
pub enum CreateProgress {
    CreatingVenv,
    InstallingPackages,
    RegisteringKernel,
    Complete,
}

pub async fn create_default_environment(app: tauri::AppHandle) -> Result<(), String> {
    let env_dir = get_env_dir();
    let project_dir = get_project_dir();

    ensure_dir(&get_pyforge_root())?;
    ensure_dir(&project_dir)?;

    let _ = app.emit("env-progress", "正在创建虚拟环境...");

    let output = Command::new("uv")
        .args(["venv", env_dir.to_str().unwrap(), "--python", "3.10"])
        .output()
        .await
        .map_err(|e| format!("执行 uv venv 失败: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("创建虚拟环境失败: {}", stderr));
    }

    let _ = app.emit("env-progress", "正在安装基础包 (numpy, pandas, matplotlib)...");

    let python = get_python_path();
    let mirror_url = PYPI_MIRROR_URL;
    let output = Command::new("uv")
        .args([
            "pip", "install", "--python",
            python.to_str().unwrap(),
            "--index-url", mirror_url,
            "numpy", "pandas", "matplotlib", "ipykernel", "jupyterlab",
        ])
        .output()
        .await
        .map_err(|e| format!("安装包失败: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("安装包失败: {}", stderr));
    }

    let _ = app.emit("env-progress", "正在注册 Jupyter 内核...");

    let kernel_name = "pyforge-default";
    let output = Command::new(&python)
        .args([
            "-m", "ipykernel", "install", "--user",
            "--name", kernel_name,
            "--display-name", "PyForge (Python 3.10)",
        ])
        .output()
        .await
        .map_err(|e| format!("注册内核失败: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("注册内核失败: {}", stderr));
    }

    let _ = app.emit("env-progress", "环境创建完成");

    Ok(())
}
