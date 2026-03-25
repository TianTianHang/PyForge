use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JupyterInfo {
    pub port: u16,
    pub token: String,
    pub url: String,
    pub notebook_dir: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JupyterServerConfig {
    pub port: u16,
    pub token: String,
    pub notebook_dir: String,
    pub executable_path: String,
    pub kernel_dirs: Vec<String>,
}
