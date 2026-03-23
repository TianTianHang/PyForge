use crate::domain::environment::{check_env_exists, create_default_environment};
use crate::infrastructure::get_env_dir;
use crate::models::EnvStatus;

/// 检查环境状态
#[tauri::command]
pub fn check_env() -> EnvStatus {
    let env_dir = get_env_dir();
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
