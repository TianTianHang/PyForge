use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvStatus {
    pub exists: bool,
    pub path: String,
}
