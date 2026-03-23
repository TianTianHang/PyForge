use crate::models::{AppState, JupyterInfo};
use crate::state::AppStateWrapper;
use tauri::State;

/// 获取当前 Jupyter 信息
#[tauri::command]
pub fn get_jupyter_info(state: State<AppStateWrapper>) -> Result<Option<JupyterInfo>, String> {
    Ok(state.get_jupyter_info())
}

/// 获取应用状态
#[tauri::command]
pub fn get_app_state(state: State<AppStateWrapper>) -> Result<AppState, String> {
    Ok(state.get_app_state())
}
