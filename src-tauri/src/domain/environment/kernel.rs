use std::path::PathBuf;
use serde_json::json;

use crate::infrastructure::{ensure_dir, get_kernel_store_dir};

pub async fn register_jupyter_kernel(
    python_path: &PathBuf,
    env_id: &str,
    env_name: &str,
    python_version: &str,
) -> Result<(), String> {
    let kernel_name = format!("pyforge-{}", env_id);
    let display_name = format!("PyForge - {} (Python {})", env_name, python_version);

    let kernel_dir = get_kernel_store_dir().join(&kernel_name);
    ensure_dir(&kernel_dir)?;

    let kernel_json = json!({
        "argv": [
            python_path.to_string_lossy(),
            "-m", "ipykernel_launcher",
            "-f", "{connection_file}"
        ],
        "display_name": display_name,
        "language": "python"
    });

    let kernel_json_path = kernel_dir.join("kernel.json");
    let content = serde_json::to_string_pretty(&kernel_json)
        .map_err(|e| format!("序列化 kernel.json 失败: {}", e))?;
    std::fs::write(&kernel_json_path, content)
        .map_err(|e| format!("写入 kernel.json 失败: {}", e))?;

    Ok(())
}

pub async fn unregister_kernel(env_id: &str) -> Result<(), String> {
    let kernel_name = format!("pyforge-{}", env_id);
    let kernel_dir = get_kernel_store_dir().join(&kernel_name);

    if kernel_dir.exists() {
        std::fs::remove_dir_all(&kernel_dir)
            .map_err(|e| format!("删除内核目录失败: {}", e))?;
    }

    Ok(())
}
