use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JupyterInfo {
    pub port: u16,
    #[deprecated(since = "0.1.0", note = "Token authentication has been disabled. This field is always empty and will be removed in a future version.")]
    pub token: String,
    pub url: String,
    pub notebook_dir: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JupyterServerConfig {
    pub port: u16,
    #[deprecated(since = "0.1.0", note = "Token authentication has been disabled. This field is always empty and will be removed in a future version.")]
    pub token: String,
    pub notebook_dir: String,
    pub executable_path: String,
    pub kernel_dirs: Vec<String>,
}
