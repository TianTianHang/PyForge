use std::path::PathBuf;
use tokio::process::Command;

use crate::infrastructure::get_python_path;

pub async fn register_jupyter_kernel(
    python_path: &PathBuf,
    env_id: &str,
    env_name: &str,
    python_version: &str,
) -> Result<(), String> {
    let kernel_name = format!("pyforge-{}", env_id);
    let display_name = format!("PyForge - {} (Python {})", env_name, python_version);
    let output = Command::new(python_path)
        .args([
            "-m", "ipykernel", "install", "--user",
            "--name", &kernel_name,
            "--display-name", &display_name,
        ])
        .output()
        .await
        .map_err(|e| format!("注册内核失败: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("注册内核失败: {}", stderr));
    }

    Ok(())
}

pub async fn unregister_kernel(env_id: &str) -> Result<(), String> {
    let kernel_name = format!("pyforge-{}", env_id);
    let python_path = get_python_path(env_id);
    let output = Command::new(python_path)
        .args([
            "-m", "jupyter", "kernelspec", "uninstall", &kernel_name, "-y"
        ])
        .output()
        .await
        .map_err(|e| format!("注销内核失败: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("注销内核失败: {}", stderr));
    }

    Ok(())
}
