use crate::domain::jupyter::{get_base_python, start_jupyter_server, stop_jupyter_server};
use crate::infrastructure::{find_available_port, get_project_dir_by_id};
use crate::models::{JupyterInfo, JupyterServerConfig};
use crate::state::AppStateWrapper;
use tauri::State;

/// 启动 Jupyter Server（异步，不会阻塞 UI）
#[tauri::command]
pub async fn start_jupyter(
    state: State<'_, AppStateWrapper>,
    project_id: String,
) -> Result<JupyterInfo, String> {
    {
        if let Some(ref info) = state.get_jupyter_info() {
            return Ok(info.clone());
        }
    }

    let python_path = get_base_python()?;

    // Get project directory
    let project_dir = get_project_dir_by_id(&project_id);
    if !project_dir.exists() {
        return Err(format!("项目目录不存在: {:?}", project_dir));
    }

    let notebook_dir = project_dir.to_string_lossy().to_string();

    // JUPYTER_PATH auto-appends /kernels, so pass the project dir (not kernels subdir)
    let kernel_dirs = vec![project_dir.to_string_lossy().to_string()];

    let config = JupyterServerConfig {
        port: find_available_port()?,
        token: String::new(),
        notebook_dir: notebook_dir.clone(),
        executable_path: python_path.to_string_lossy().to_string(),
        kernel_dirs,
    };

    let info = start_jupyter_server(config).await?;
    let pid = None;
    state.set_jupyter_info(info.clone(), pid);

    Ok(info)
}

/// 停止 Jupyter Server
#[tauri::command]
pub async fn stop_jupyter(state: State<'_, AppStateWrapper>) -> Result<String, String> {
    let pid = state.clear_jupyter();

    if let Some(pid) = pid {
        stop_jupyter_server(pid).await?;
    }

    Ok("Jupyter 已停止".to_string())
}
