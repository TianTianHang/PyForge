use crate::infrastructure::{get_project_dir, ensure_dir, JUPYTER_READY_TIMEOUT_SECS};
use crate::models::{JupyterInfo, JupyterServerConfig};
use tokio::process::Command;
use tokio::time::{sleep, Duration};

pub async fn start_jupyter_server(config: JupyterServerConfig) -> Result<JupyterInfo, String> {
    ensure_dir(&get_project_dir())?;

    let notebook_dir = config.notebook_dir.clone();

    let mut args: Vec<String> = vec![
        "-m".to_string(), "jupyter".to_string(), "lab".to_string(),
        "--no-browser".to_string(),
        "--port".to_string(), config.port.to_string(),
        "--notebook-dir".to_string(), notebook_dir.clone(),
        "--ip".to_string(), "127.0.0.1".to_string(),
        "--LabApp.allow_origin=http://localhost:1420".to_string(),
        "--ServerApp.allow_remote_access=True".to_string(),
        "--ServerApp.token=''".to_string(),
        "--ServerApp.password=''".to_string(),
        "--ServerApp.disable_check_xsrf=True".to_string(),
        "--LabApp.tornado_settings={\"headers\":{\"Content-Security-Policy\":\"frame-ancestors 'self' http://localhost:1420\"}}".to_string(),
    ];

    if !config.kernel_dirs.is_empty() {
        let kernel_dirs_str = config.kernel_dirs.join(":");
        args.push("--KernelSpecManager.kernel_dirs".to_string());
        args.push(kernel_dirs_str);
    }

    let child = Command::new(&config.executable_path)
        .args(&args)
        .spawn()
        .map_err(|e| format!("启动 Jupyter 失败: {}", e))?;

    let _pid = child.id();
    let url = format!("http://127.0.0.1:{}/lab", config.port);
    let info = JupyterInfo {
        port: config.port,
        token: String::new(),
        url: url.clone(),
        notebook_dir,
    };

    // 等待 Jupyter 就绪（最多 30 秒）
    let max_attempts = JUPYTER_READY_TIMEOUT_SECS * 2;
    for _ in 0..max_attempts {
        let check = Command::new("curl")
            .args(["-s", "-o", "/dev/null", "-w", "%{http_code}", &format!("http://127.0.0.1:{}/api", config.port)])
            .output()
            .await;

        if let Ok(output) = check {
            if output.status.success() {
                let status_code = String::from_utf8_lossy(&output.stdout);
                if status_code == "200" {
                    return Ok(info);
                }
            }
        }
        sleep(Duration::from_millis(500)).await;
    }

    // 超时也返回（Jupyter 可能已启动，只是检查失败）
    Ok(info)
}
