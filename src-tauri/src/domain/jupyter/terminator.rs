use crate::infrastructure::process;

/// Stop the Jupyter server by forcefully terminating the process tree.
///
/// This function delegates to `kill_forcefully` which ensures all child processes
/// are terminated on Windows using the /T flag.
pub async fn stop_jupyter_server(pid: u32) -> Result<(), String> {
    process::kill_forcefully(pid).await
}
