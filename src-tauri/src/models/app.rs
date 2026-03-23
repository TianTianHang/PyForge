use super::{EnvStatus, JupyterInfo};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppState {
    pub env_status: EnvStatus,
    pub jupyter_info: Option<JupyterInfo>,
    pub jupyter_pid: Option<u32>,
}
