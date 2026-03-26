use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Template {
    pub id: String,
    pub display_name: String,
    pub description: String,
    pub icon: String,
    pub dependencies: Vec<String>,
    pub use_cases: Vec<String>,
    pub requires_python: String,
}

#[derive(Debug, Deserialize)]
pub struct PyProjectToml {
    pub project: PyProject,
    #[serde(default)]
    pub tool: ToolSection,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct PyProject {
    pub name: String,
    pub description: Option<String>,
    #[serde(default)]
    pub requires_python: Option<String>,
    #[serde(default)]
    pub dependencies: Vec<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct ToolSection {
    #[serde(default)]
    pub pyforge: PyForgeSection,
}

#[derive(Debug, Deserialize, Default)]
#[serde(rename_all = "kebab-case")]
pub struct PyForgeSection {
    #[serde(default)]
    pub display_name: String,
    #[serde(default)]
    pub icon: String,
    #[serde(default)]
    pub use_cases: Vec<String>,
}
