use tauri::AppHandle;
use tauri_plugin_shell::{ShellExt, process::Output};

use crate::infrastructure::get_uv_config_path;

/// 执行 uv 命令并获取输出（使用 sidecar）
///
/// Tauri 会根据平台自动选择正确的二进制文件：
/// - Linux: uv-x86_64-unknown-linux-gnu
/// - macOS: uv-aarch64-apple-darwin
/// - Windows: uv-x86_64-pc-windows-msvc.exe
pub async fn run_uv_command(app: &AppHandle, args: &[&str]) -> Result<Output, String> {
    let uv_config_path = get_uv_config_path();
    let config_path_str = uv_config_path.to_string_lossy().to_string();

    let mut cmd = app.shell().sidecar("uv")
        .map_err(|e| format!("无法获取 uv sidecar: {}", e))?;

    cmd = cmd.arg("--config-file").arg(&config_path_str);

    for arg in args {
        cmd = cmd.arg(*arg);
    }

    // 使用 output() 方法获取完整输出
    cmd.output()
        .await
        .map_err(|e| format!("执行 uv 命令失败: {}", e))
}
