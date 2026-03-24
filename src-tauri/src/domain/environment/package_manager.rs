use serde_json::Value;
use tauri::Emitter;
use tokio::process::Command;

use crate::infrastructure::{get_python_path, PYPI_MIRROR_URL};
use crate::models::InstalledPackage;

pub async fn list_packages(env_id: &str) -> Result<Vec<InstalledPackage>, String> {
    let python = get_python_path(env_id);
    let output = Command::new("uv")
        .args(["pip", "list", "--python", python.to_str().ok_or_else(|| "Python 路径无效".to_string())?, "--format", "json"])
        .output()
        .await
        .map_err(|e| format!("获取包列表失败: {}", e))?;

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
    app: tauri::AppHandle,
    env_id: &str,
    package_name: &str,
) -> Result<(), String> {
    let python = get_python_path(env_id);
    let _ = app.emit("env-progress", format!("正在安装包 {}...", package_name));

    let output = Command::new("uv")
        .args([
            "pip",
            "install",
            "--python",
            python.to_str().ok_or_else(|| "Python 路径无效".to_string())?,
            "--index-url",
            PYPI_MIRROR_URL,
            package_name,
        ])
        .output()
        .await
        .map_err(|e| format!("安装包失败: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("安装包失败: {}", stderr));
    }

    Ok(())
}

pub async fn uninstall_package(env_id: &str, package_name: &str) -> Result<(), String> {
    let python = get_python_path(env_id);
    let output = Command::new("uv")
        .args([
            "pip",
            "uninstall",
            "--python",
            python.to_str().ok_or_else(|| "Python 路径无效".to_string())?,
            package_name,
        ])
        .output()
        .await
        .map_err(|e| format!("卸载包失败: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("卸载包失败: {}", stderr));
    }

    Ok(())
}
