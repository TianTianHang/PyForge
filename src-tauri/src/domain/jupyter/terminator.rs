use tokio::process::Command;

pub async fn stop_jupyter_server(pid: u32) -> Result<(), String> {
    #[cfg(unix)]
    {
        let _ = Command::new("kill")
            .args(["-9", &pid.to_string()])
            .output()
            .await;
    }
    #[cfg(windows)]
    {
        let _ = Command::new("taskkill")
            .args(["/F", "/PID", &pid.to_string()])
            .output()
            .await;
    }
    Ok(())
}
