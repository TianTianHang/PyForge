use tauri::AppHandle;
use tauri_plugin_shell::{ShellExt, process::Output};

use crate::infrastructure::get_uv_config_path;
use crate::debug;

/// 执行 uv 命令并获取输出（使用 sidecar）
///
/// Tauri 会根据平台自动选择正确的二进制文件：
/// - Linux: uv-x86_64-unknown-linux-gnu
/// - macOS: uv-aarch64-apple-darwin
/// - Windows: uv-x86_64-pc-windows-msvc.exe
pub async fn run_uv_command(app: &AppHandle, args: &[&str]) -> Result<Output, String> {
    let uv_config_path = get_uv_config_path();
    let config_path_str = uv_config_path.to_string_lossy().to_string();

    debug!("🔧 [UV] 执行命令: uv --config-file {} {}", config_path_str, args.join(" "));

    let mut cmd = app.shell().sidecar("uv")
        .map_err(|e| {
            debug!("❌ [UV] 无法获取 uv sidecar: {}", e);
            format!("无法获取 uv sidecar: {}", e)
        })?;

    cmd = cmd.arg("--config-file").arg(&config_path_str);

    for arg in args {
        cmd = cmd.arg(*arg);
    }

    // 使用 output() 方法获取完整输出
    let result = cmd.output()
        .await
        .map_err(|e| {
            debug!("❌ [UV] 执行命令失败: {}", e);
            format!("执行 uv 命令失败: {}", e)
        })?;

    debug!("📊 [UV] 退出码: {}", result.status.code().unwrap_or(-1));

    if !result.stdout.is_empty() {
        let stdout = String::from_utf8_lossy(&result.stdout);
        debug!("📤 [UV] 标准输出:\n{}", stdout);
    }

    if !result.stderr.is_empty() {
        let stderr = String::from_utf8_lossy(&result.stderr);
        debug!("⚠️  [UV] 标准错误:\n{}", stderr);
    }

    Ok(result)
}
