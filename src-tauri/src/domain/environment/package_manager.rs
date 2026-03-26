use serde_json::Value;
use tauri::{AppHandle, Emitter};

use crate::infrastructure::{get_python_path, path_to_str, run_uv_command};
use crate::models::InstalledPackage;

pub async fn list_packages(app: AppHandle, env_id: &str) -> Result<Vec<InstalledPackage>, String> {
    let python = get_python_path(env_id);
    let python_str = path_to_str(&python)?;

    // Use sidecar to execute uv
    let output = run_uv_command(&app, &["pip", "list", "--python", python_str, "--format", "json"]).await?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("获取包列表失败: {}", stderr));
    }

    let packages: Vec<Value> = serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("解析包列表失败: {}", e))?;

    Ok(packages
        .into_iter()
        .filter_map(|item| {
            Some(InstalledPackage {
                name: item.get("name")?.as_str()?.to_string(),
                version: item.get("version")?.as_str()?.to_string(),
            })
        })
        .collect())
}

pub async fn install_package(
    app: AppHandle,
    env_id: &str,
    package_name: &str,
) -> Result<(), String> {
    let python = get_python_path(env_id);
    let _ = app.emit("env-progress", format!("正在安装包 {}...", package_name));

    let python_str = path_to_str(&python)?;

    let output = run_uv_command(&app, &[
        "pip",
        "install",
        "--python",
        python_str,
        package_name,
    ]).await?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("安装包失败: {}", stderr));
    }

    Ok(())
}

pub async fn uninstall_package(app: AppHandle, env_id: &str, package_name: &str) -> Result<(), String> {
    let python = get_python_path(env_id);
    let python_str = path_to_str(&python)?;

    // 使用 -y 参数自动确认卸载，无需用户交互
    let output = run_uv_command(&app, &[
        "pip",
        "uninstall",
        "--python",
        python_str,
        "-y",
        package_name,
    ]).await?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("卸载包失败: {}", stderr));
    }

    Ok(())
}
