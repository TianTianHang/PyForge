use std::time::Duration;
use tokio::process::{Child, Command};
use tokio::time::sleep;

pub async fn spawn(command: &str, args: &[&str]) -> Result<Child, String> {
    Command::new(command)
        .args(args)
        .spawn()
        .map_err(|e| format!("启动进程失败: {}", e))
}

/// Gracefully terminate a process by sending SIGTERM (Unix) or taskkill without /F (Windows).
///
/// On Windows, uses `taskkill /T /PID` to terminate the process tree including all child processes.
/// Returns an error if the command fails to execute or returns a non-zero exit status.
pub async fn kill_gracefully(pid: u32) -> Result<(), String> {
    #[cfg(unix)]
    {
        let output = Command::new("kill")
            .args(["-TERM", &pid.to_string()])
            .output()
            .await
            .map_err(|e| format!("执行终止命令失败: {}", e))?;

        if !output.status.success() {
            return Err(format!(
                "终止进程失败: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }
    }
    #[cfg(windows)]
    {
        let output = Command::new("taskkill")
            .args(["/T", "/PID", &pid.to_string()])
            .output()
            .await
            .map_err(|e| format!("执行终止命令失败: {}", e))?;

        if !output.status.success() {
            return Err(format!(
                "终止进程失败: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }
    }
    Ok(())
}

/// Forcefully terminate a process by sending SIGKILL (Unix) or taskkill with /F (Windows).
///
/// On Windows, uses `taskkill /F /T /PID` to forcefully terminate the process tree including
/// all child processes. The /F flag ensures forceful termination, while /T ensures the
/// entire process tree is terminated.
/// Returns an error if the command fails to execute or returns a non-zero exit status.
pub async fn kill_forcefully(pid: u32) -> Result<(), String> {
    #[cfg(unix)]
    {
        let output = Command::new("kill")
            .args(["-9", &pid.to_string()])
            .output()
            .await
            .map_err(|e| format!("执行终止命令失败: {}", e))?;

        if !output.status.success() {
            return Err(format!(
                "终止进程失败: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }
    }
    #[cfg(windows)]
    {
        let output = Command::new("taskkill")
            .args(["/F", "/T", "/PID", &pid.to_string()])
            .output()
            .await
            .map_err(|e| format!("执行终止命令失败: {}", e))?;

        if !output.status.success() {
            return Err(format!(
                "终止进程失败: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }
    }
    Ok(())
}

pub async fn wait_for_ready(url: &str, timeout_secs: u64) -> Result<(), String> {
    let max_attempts = timeout_secs * 2;
    for _ in 0..max_attempts {
        let check = Command::new("curl")
            .args(["-s", "-o", "/dev/null", "-w", "%{http_code}", url])
            .output()
            .await;

        if let Ok(output) = check {
            if output.status.success() {
                let status_code = String::from_utf8_lossy(&output.stdout);
                if status_code == "200" {
                    return Ok(());
                }
            }
        }
        sleep(Duration::from_millis(500)).await;
    }
    Err("等待服务就绪超时".to_string())
}
