use crate::domain::environment::{
    check_env_exists, create_default_environment, create_environment as create_environment_impl,
    delete_environment as delete_environment_impl, list_environments as list_environments_impl,
};
use crate::domain::jupyter::ensure_base_env;
use crate::infrastructure::get_env_dir;
use crate::models::{EnvStatus, Environment, InstalledPackage};
use std::sync::OnceLock;
use tokio::sync::Mutex;

static INIT_MUTEX: OnceLock<Mutex<bool>> = OnceLock::new();

fn get_init_mutex() -> &'static Mutex<bool> {
    INIT_MUTEX.get_or_init(|| Mutex::new(false))
}

/// 应用初始化：确保 base 环境和 default 环境存在
#[tauri::command]
pub async fn initialize_app(app: tauri::AppHandle) -> Result<String, String> {
   
    let _guard = get_init_mutex().lock().await;
  

    if check_env_exists() {
        return Ok("环境已存在".to_string());
    }


    ensure_base_env(&app).await?;
  
    if !check_env_exists() {
        create_default_environment(app).await?;
    }

    Ok("初始化完成".to_string())
}

/// 检查环境状态
#[tauri::command]
pub fn check_env() -> EnvStatus {
    let env_dir = get_env_dir("default");
    EnvStatus {
        exists: check_env_exists(),
        path: env_dir.to_string_lossy().to_string(),
    }
}

/// 创建默认环境（异步，不会阻塞 UI）
#[tauri::command]
pub async fn create_env(app: tauri::AppHandle) -> Result<String, String> {
    if check_env_exists() {
        return Ok("环境已存在".to_string());
    }

    create_default_environment(app).await?;

    Ok("环境创建成功".to_string())
}

/// 获取所有环境列表
#[tauri::command]
pub fn list_environments() -> Result<Vec<Environment>, String> {
    list_environments_impl()
}

/// 创建新环境
#[tauri::command]
pub async fn create_environment(
    app: tauri::AppHandle,
    name: String,
    python_version: String,
    packages: Vec<String>,
) -> Result<Environment, String> {
    create_environment_impl(app, name, python_version, packages, None).await
}

/// 删除环境
#[tauri::command]
pub async fn delete_environment(env_id: String) -> Result<(), String> {
    delete_environment_impl(&env_id).await
}

/// 获取环境的包列表
#[tauri::command]
pub async fn list_packages(env_id: String) -> Result<Vec<InstalledPackage>, String> {
    crate::domain::environment::package_manager::list_packages(&env_id).await
}

/// 安装包
#[tauri::command]
pub async fn install_package(
    app: tauri::AppHandle,
    env_id: String,
    package_name: String,
) -> Result<(), String> {
    crate::domain::environment::package_manager::install_package(app, &env_id, &package_name).await
}

/// 卸载包
#[tauri::command]
pub async fn uninstall_package(env_id: String, package_name: String) -> Result<(), String> {
    crate::domain::environment::package_manager::uninstall_package(&env_id, &package_name).await
}
