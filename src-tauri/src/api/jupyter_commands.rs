use crate::domain::environment::check_env_exists;
use crate::domain::jupyter::{start_jupyter_server, stop_jupyter_server};
use crate::infrastructure::{find_available_port, get_project_dir};
use crate::models::{JupyterInfo, JupyterServerConfig};
use crate::state::AppStateWrapper;
use tauri::State;

/// 启动 Jupyter Server（异步，不会阻塞 UI）
#[tauri::command]
pub async fn start_jupyter(state: State<'_, AppStateWrapper>) -> Result<JupyterInfo, String> {
    if !check_env_exists() {
        return Err("环境不存在，请先创建环境".to_string());
    }

    // 检查是否已有运行中的 Jupyter
    {
        if let Some(ref info) = state.get_jupyter_info() {
            return Ok(info.clone());
        }
    }

    let port = find_available_port()?;
    let notebook_dir = get_project_dir().to_string_lossy().to_string();

    let config = JupyterServerConfig {
        port,
        token: String::new(),
        notebook_dir: notebook_dir.clone(),
    };

    let info = start_jupyter_server(config).await?;

    // 保存状态
    let pid = None; // Will be set by the actual spawn
    state.set_jupyter_info(info.clone(), pid);

    Ok(info)
}

/// 停止 Jupyter Server
#[tauri::command]
pub async fn stop_jupyter(state: State<'_, AppStateWrapper>) -> Result<String, String> {
    let pid = state.clear_jupyter();

    // 在锁释放后执行异步操作
    if let Some(pid) = pid {
        stop_jupyter_server(pid).await?;
    }

    Ok("Jupyter 已停止".to_string())
}
