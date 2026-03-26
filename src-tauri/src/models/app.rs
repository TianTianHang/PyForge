use serde::{Deserialize, Serialize};

use super::{EnvStatus, Environment, JupyterInfo, Project};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppState {
    pub env_status: EnvStatus,
    pub environments: Vec<Environment>,
    pub current_env_id: Option<String>,
    pub jupyter_info: Option<JupyterInfo>,
    pub jupyter_pid: Option<u32>,
    pub projects: Vec<Project>,
    pub current_project_id: Option<String>,
}
