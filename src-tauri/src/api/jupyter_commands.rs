use crate::domain::environment::list_environments;
use crate::domain::jupyter::{get_base_python, start_jupyter_server, stop_jupyter_server};
use crate::infrastructure::{find_available_port, get_project_dir, get_kernel_store_dir};
use crate::models::{JupyterInfo, JupyterServerConfig};
use crate::state::AppStateWrapper;
use tauri::State;

/// 启动 Jupyter Server（异步，不会阻塞 UI）
#[tauri::command]
pub async fn start_jupyter(
    state: State<'_, AppStateWrapper>,
    env_id: Option<String>,
) -> Result<JupyterInfo, String> {
    {
        if let Some(ref info) = state.get_jupyter_info() {
            return Ok(info.clone());
        }
    }

    let python_path = get_base_python()?;

    let environments = list_environments()?;
    let _selected_env = if let Some(env_id) = env_id {
        environments
            .into_iter()
            .find(|env| env.id == env_id)
            .ok_or("指定的环境不存在".to_string())?
    } else {
        let default_env = environments.iter().find(|env| env.is_default);
        if let Some(env) = default_env {
            env.clone()
        } else {
            environments
                .into_iter()
                .next()
                .ok_or("没有可用的环境".to_string())?
        }
    };

    let port = find_available_port()?;
    let notebook_dir = get_project_dir().to_string_lossy().to_string();

    let project_kernel_dir = get_project_dir().join("kernels");
    let global_kernel_dir = get_kernel_store_dir();

    let mut kernel_dirs: Vec<String> = Vec::new();
    if project_kernel_dir.exists() {
        kernel_dirs.push(project_kernel_dir.to_string_lossy().to_string());
    }
    kernel_dirs.push(global_kernel_dir.to_string_lossy().to_string());

    let config = JupyterServerConfig {
        port,
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
