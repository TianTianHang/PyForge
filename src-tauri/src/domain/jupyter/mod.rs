pub mod base_env;
pub mod launcher;
pub mod terminator;

pub use base_env::{ensure_base_env, get_base_python};
pub use launcher::start_jupyter_server;
pub use terminator::stop_jupyter_server;

use crate::infrastructure::{ensure_dir, find_available_port, get_project_dir};
use crate::models::{JupyterInfo, JupyterServerConfig};

pub struct JupyterServer {
    pub info: Option<JupyterInfo>,
    pub pid: Option<u32>,
}

impl JupyterServer {
    pub fn new() -> Self {
        Self {
            info: None,
            pid: None,
        }
    }

    pub async fn start(&mut self, env_id: &str) -> Result<JupyterInfo, String> {
        let _ = env_id;
        let python_path = get_base_python()?;
        let port = find_available_port()?;
        let notebook_dir = get_project_dir().to_string_lossy().to_string();

        // Always specify kernel directories (create if not exists)
        // This ensures Jupyter knows where to find project-scoped kernels
        let project_kernel_dir = get_project_dir().join("kernels");
        let _ = ensure_dir(&project_kernel_dir);

        let kernel_dirs = vec![project_kernel_dir.to_string_lossy().to_string()];

        let config = JupyterServerConfig {
            port,
            token: String::new(),
            notebook_dir: notebook_dir.clone(),
            executable_path: python_path.to_string_lossy().to_string(),
            kernel_dirs,
        };

        let info = start_jupyter_server(config).await?;
        self.pid = None;
        self.info = Some(info.clone());
        Ok(info)
    }

    pub async fn stop(&mut self) -> Result<(), String> {
        if let Some(pid) = self.pid {
            stop_jupyter_server(pid).await?;
            self.info = None;
            self.pid = None;
        }
        Ok(())
    }

    pub fn is_running(&self) -> bool {
        self.info.is_some()
    }
}

impl Default for JupyterServer {
    fn default() -> Self {
        Self::new()
    }
}
