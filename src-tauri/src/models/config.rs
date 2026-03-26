use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SourceConfig {
    #[serde(default = "default_pypi_mirror")]
    pub pypi_mirror: String,
    #[serde(default)]
    pub python_install_mirror: Option<String>,
}

fn default_pypi_mirror() -> String {
    "https://pypi.org/simple".to_string()
}

impl Default for SourceConfig {
    fn default() -> Self {
        Self {
            pypi_mirror: default_pypi_mirror(),
            python_install_mirror: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PythonDownloadStrategy {
    Automatic,
    Manual,
    Never,
}

impl Default for PythonDownloadStrategy {
    fn default() -> Self {
        Self::Automatic
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PythonConfig {
    #[serde(default = "default_python_version")]
    pub default_version: String,
    #[serde(default)]
    pub download_strategy: PythonDownloadStrategy,
}

fn default_python_version() -> String {
    "3.12".to_string()
}

impl Default for PythonConfig {
    fn default() -> Self {
        Self {
            default_version: default_python_version(),
            download_strategy: PythonDownloadStrategy::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PathsConfig {
    #[serde(default)]
    pub data_dir: Option<String>,
}

impl Default for PathsConfig {
    fn default() -> Self {
        Self { data_dir: None }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JupyterConfig {
    #[serde(default = "default_port_range_start")]
    pub port_range_start: u16,
    #[serde(default = "default_port_range_end")]
    pub port_range_end: u16,
    #[serde(default = "default_timeout_secs")]
    pub timeout_secs: u64,
}

fn default_port_range_start() -> u16 {
    8000
}

fn default_port_range_end() -> u16 {
    9000
}

fn default_timeout_secs() -> u64 {
    30
}

impl Default for JupyterConfig {
    fn default() -> Self {
        Self {
            port_range_start: default_port_range_start(),
            port_range_end: default_port_range_end(),
            timeout_secs: default_timeout_secs(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DefaultsConfig {
    #[serde(default = "default_packages")]
    pub packages: Vec<String>,
}

fn default_packages() -> Vec<String> {
    vec![
        "numpy".to_string(),
        "pandas".to_string(),
        "matplotlib".to_string(),
        "ipykernel".to_string(),
    ]
}

impl Default for DefaultsConfig {
    fn default() -> Self {
        Self {
            packages: default_packages(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AppConfig {
    #[serde(default)]
    pub sources: SourceConfig,
    #[serde(default)]
    pub python: PythonConfig,
    #[serde(default)]
    pub paths: PathsConfig,
    #[serde(default)]
    pub jupyter: JupyterConfig,
    #[serde(default)]
    pub defaults: DefaultsConfig,
}

impl AppConfig {
    pub fn data_dir(&self) -> std::path::PathBuf {
        match &self.paths.data_dir {
            Some(dir) => std::path::PathBuf::from(dir),
            None => dirs::home_dir()
                .expect("无法获取用户主目录")
                .join(".pyforge"),
        }
    }
}
