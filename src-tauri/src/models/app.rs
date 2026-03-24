use serde::{Deserialize, Serialize};

use super::{Environment, EnvStatus, JupyterInfo};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppState {
    pub env_status: EnvStatus,
    pub environments: Vec<Environment>,
    pub current_env_id: Option<String>,
    pub jupyter_info: Option<JupyterInfo>,
    pub jupyter_pid: Option<u32>,
}
