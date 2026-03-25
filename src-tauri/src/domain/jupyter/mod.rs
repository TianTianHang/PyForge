pub mod base_env;
pub mod launcher;
pub mod terminator;

pub use base_env::{ensure_base_env, get_base_python};
pub use launcher::start_jupyter_server;
pub use terminator::stop_jupyter_server;

use crate::infrastructure::{find_available_port, get_kernel_store_dir, get_project_dir};
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

        let global_kernel_dir = get_kernel_store_dir();
        let project_kernel_dir = get_project_dir().join("kernels");
        let mut kernel_dirs: Vec<String> = Vec::new();
        if project_kernel_dir.exists() {
            kernel_dirs.push(project_kernel_dir.to_string_lossy().to_string());
        }
        kernel_dirs.push(global_kernel_dir.to_string_lossy().to_string());

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
