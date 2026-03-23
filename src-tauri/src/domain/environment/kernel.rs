use std::path::PathBuf;
use tokio::process::Command;

pub async fn register_jupyter_kernel(python_path: &PathBuf) -> Result<(), String> {
    let kernel_name = "pyforge-default";
    let output = Command::new(python_path)
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

    Ok(())
}
