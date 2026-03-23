pub mod commands;

use rand::Rng;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;
use uuid::Uuid;

// ============================================================================
// 数据结构
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvStatus {
    pub exists: bool,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JupyterInfo {
    pub port: u16,
    pub token: String,
    pub url: String,
    pub notebook_dir: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppState {
    pub env_status: EnvStatus,
    pub jupyter_info: Option<JupyterInfo>,
    pub jupyter_pid: Option<u32>,
}

// ============================================================================
// 路径管理
// ============================================================================

pub fn get_pyforge_root() -> PathBuf {
    dirs::home_dir()
        .expect("无法获取用户主目录")
        .join(".pyforge")
}

pub fn get_env_dir() -> PathBuf {
    get_pyforge_root().join("env")
}

pub fn get_project_dir() -> PathBuf {
    get_pyforge_root().join("project")
}

pub fn ensure_dir(path: &PathBuf) -> Result<(), String> {
    std::fs::create_dir_all(path).map_err(|e| format!("创建目录失败: {}", e))
}

// ============================================================================
// 环境管理
// ============================================================================

/// 获取 PyPI 镜像源 URL（清华源）
pub fn get_pypi_mirror_url() -> &'static str {
    "https://pypi.tuna.tsinghua.edu.cn/simple"
}

pub fn check_env_exists() -> bool {
    let env_dir = get_env_dir();
    env_dir.exists() && env_dir.join("bin").join("python").exists()
}

pub fn get_python_path() -> PathBuf {
    let env_dir = get_env_dir();
    if cfg!(target_os = "windows") {
        env_dir.join("Scripts").join("python.exe")
    } else {
        env_dir.join("bin").join("python")
    }
}

pub fn get_jupyter_path() -> PathBuf {
    let env_dir = get_env_dir();
    if cfg!(target_os = "windows") {
        env_dir.join("Scripts").join("jupyter.exe")
    } else {
        env_dir.join("bin").join("jupyter")
    }
}

// ============================================================================
// 应用状态包装器
// ============================================================================

pub struct AppStateWrapper(pub Mutex<AppState>);

impl Default for AppStateWrapper {
    fn default() -> Self {
        Self(Mutex::new(AppState {
            env_status: EnvStatus {
                exists: false,
                path: String::new(),
            },
            jupyter_info: None,
            jupyter_pid: None,
        }))
    }
}

// ============================================================================
// 工具函数
// ============================================================================

pub fn find_available_port() -> Result<u16, String> {
    let mut rng = rand::rng();
    for _ in 0..10 {
        let port = rng.random_range(8000..9000);
        if is_port_available(port) {
            return Ok(port);
        }
    }
    Err("无法找到可用端口".to_string())
}

pub fn is_port_available(port: u16) -> bool {
    std::net::TcpListener::bind(("127.0.0.1", port)).is_ok()
}

pub fn generate_token() -> String {
    Uuid::new_v4().to_string().replace("-", "")
}

// ============================================================================
// Tauri 入口
// ============================================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppStateWrapper::default())
        .invoke_handler(tauri::generate_handler![
            commands::check_env,
            commands::create_env,
            commands::start_jupyter,
            commands::stop_jupyter,
            commands::get_jupyter_info,
            commands::get_app_state,
        ])
        .setup(|app| {
            let env_dir = get_env_dir();
            let state = app.state::<AppStateWrapper>();
            let mut state_lock = state.0.lock().unwrap();
            state_lock.env_status = EnvStatus {
                exists: check_env_exists(),
                path: env_dir.to_string_lossy().to_string(),
            };
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
