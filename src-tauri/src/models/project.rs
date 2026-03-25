use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub env_id: String,
    pub path: String,
    pub created_at: String,
    pub is_default: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectsMetadata {
    pub version: u32,
    pub projects: HashMap<String, Project>,
}
