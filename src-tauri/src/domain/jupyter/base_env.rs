use std::path::PathBuf;
use tokio::process::Command;

use crate::infrastructure::{
    ensure_dir, get_base_env_dir, get_base_python_path, PYPI_MIRROR_URL,
};

pub async fn ensure_base_env() -> Result<PathBuf, String> {
    let base_dir = get_base_env_dir();
    let python_path = get_base_python_path();

    if base_dir.exists() && python_path.exists() {
        return Ok(python_path);
    }

    eprintln!("Base environment not found, creating at: {:?}", base_dir);
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

    eprintln!("Installing JupyterLab in base environment...");
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

    eprintln!("Base environment ready at: {:?}", base_dir);
    Ok(python_path)
}
